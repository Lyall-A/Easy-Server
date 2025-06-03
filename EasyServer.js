const express = require("express");
const fs = require("fs");
const path = require("path");

const { getMimeType } = require("./mime.js");

class EasyServer {
    constructor(options = { }) {
        this.server = express();
        this.port = options.port;
        this.path = path.resolve(options.path);

        this.server.disable("x-powered-by");

        this.server.use((req, res, next) => {
            const urlPath = decodeURIComponent(req.path);
            const filePath = path.join(this.path, urlPath);

            if (filePath !== this.path + urlPath) return res.sendStatus(404);
            if (!fs.existsSync(filePath)) return res.sendStatus(404);
            
            const stats = fs.statSync(filePath);
            if (stats.isDirectory()) return res.sendStatus(404);
            
            res.stats = stats;
            res.filePath = filePath;
            
            return next();
        });
        
        this.server.get("/*splat", (req, res) => {
            res.writeHead(200, {
                "Content-Length": res.stats.size,
                "Content-Type": getMimeType(res.filePath).mime
            });
            const readStream = fs.createReadStream(res.filePath);
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