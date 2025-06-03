const path = require("path");

const mimeTypes = [
    // application
    { ext: ".json", mime: "application/json" },
    // audio
    { ext: ".mp3", mime: "audio/mpeg" },
    // example
    // font
    // image
    { ext: ".apng", mime: "image/apng" },
    { ext: ".avif", mime: "image/avif" },
    { ext: ".gif", mime: "image/gif" },
    { ext: ".jpeg", mime: "image/jpeg" },
    { ext: ".jpg", mime: "image/jpeg" },
    { ext: ".png", mime: "image/png" },
    { ext: ".svg", mime: "image/svg+xml" },
    { ext: ".webp", mime: "image/webp" },
    // model
    // text
    { ext: ".js", mime: "text/javascript" },
    { ext: ".html", mime: "text/html" },
    // video
    { ext: ".mp4", mime: "video/mp4" },
    { ext: ".avi", mime: "video/x-msvideo" },
];

function getMimeType(filePath, defaultType = "application/octet-stream") {
    const ext = path.extname(filePath).toLowerCase() || null;
    const mime = mimeTypes.find(i => i.ext === ext)?.mime || defaultType || null;
    const type = mime?.split("/")[0] || null;
    const subtype = mime?.split("/")[1] || null;

    return { ext, mime, type, subtype };
}

module.exports = {
    mimeTypes,
    getMimeType
};