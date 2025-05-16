const EasyServer = require("./EasyServer");
const fs = require("fs");
const path = require("path");

const config = require("./config.json");

(async function startAllServers(files) {
    const serverConfig = JSON.parse(fs.readFileSync(files.shift(), "utf-8"));
    console.log(`[${serverConfig.name || "Unnamed server"}] Starting server on port ${serverConfig.port}...`);
    const server = new EasyServer(serverConfig);
    await server.start();
    console.log(`[${serverConfig.name || "Unnamed server"}] Started`);
    if (files.length) return startAllServers(files);
})(getFiles(config.serversLocation, {
    filter: (file) => !file.startsWith("_") && file.endsWith(".json")
}));

// https://github.com/Lyall-A/Yet-Another-Proxy/blob/main/utils/getFiles.js
function getFiles(dirPath, options = { }) {
    return (function getFilesDir(dirPath, depth = 0) {
        const files = [ ];
        const dir = fs.readdirSync(dirPath).filter(options.filter || (() => true));
        for (const filePath of dir) {
            const fullPath = path.resolve(dirPath, filePath);
            if (fs.lstatSync(fullPath).isDirectory()) {
                if (options.excludeDir && fullPath.match(options.excludeDir)) continue;
                if (options.includeDir && !fullPath.match(options.includeDir)) continue;
                if ((options.depth || options.depth === 0) && depth >= options?.depth) continue;
                files.push(...getFilesDir(fullPath, depth + 1));
            } else {
                if (options.excludeFile && fullPath.match(options.excludeFile)) continue;
                if (options.includeDir && !fullPath.match(options.includeDir)) continue;
                files.push(fullPath);
            }
        }
        return files;
    })(dirPath, 0);
}