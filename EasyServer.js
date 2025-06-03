const express = require("express");
const fs = require("fs");
const path = require("path");

const { getMimeType } = require("./mime.js");

class EasyServer {
    constructor(options = { }) {
        this.server = express();
        this.port = options.port;
        this.paths = options.paths?.map(i => path.resolve(i)) || [path.resolve(options.path)];

        this.server.disable("x-powered-by");

        this.server.use((req, res, next) => {
            const urlPath = decodeURIComponent(req.path);
            let filePath = null;

            for (const currentFilePath of this.paths) {
                filePath = path.join(currentFilePath, urlPath);

                if (filePath !== currentFilePath + urlPath) filePath = null;
                if (!fs.existsSync(filePath)) filePath = null;

                if (filePath !== null) break;
            }

            if (filePath === null) return res.sendStatus(404);
            
            const stats = fs.statSync(filePath);
            if (stats.isDirectory()) return res.sendStatus(404);
            
            res.stats = stats;
            res.filePath = filePath;
            
            return next();
        });
        
        this.server.get("/*splat", (req, res) => {
            let start = 0;
            let end = res.stats.size - 1;

            const headers = {
                "Last-Modified": res.stats.mtime.toUTCString(),
                "Accept-Ranges": "bytes",
                "Content-Length": res.stats.size,
                "Content-Type": getMimeType(res.filePath).mime,
            };

            if (req.headers["range"]) {
                const match = req.headers["range"].match(/bytes=(\d+)-(\d+)?/);
                if (match) {
                    start = Math.min(parseInt(match[1] || start), res.stats.size - 1);
                    end = Math.max(Math.min(parseInt(match[2] || end), res.stats.size - 1), start);
                    headers["Content-Length"] = end - start + 1;
                    headers["Content-Range"] = `bytes ${start}-${end}/${res.stats.size}`;
                }
            }

            res.writeHead(headers["Content-Range"] ? 206 : 200, headers);
            const readStream = fs.createReadStream(res.filePath, { start, end });
            readStream.pipe(res);
        });
    }

    start() {
        return new Promise((resolve, reject) => {
            return this.server.listen(this.port, (err) => err ? reject(err) : resolve(this));
        });
    }

    stop() {
        return this.server.close();
    }
}

module.exports = EasyServer;