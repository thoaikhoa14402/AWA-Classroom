"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const stream_1 = require("stream");
class Logger {
    constructor(logFilePath) {
        this.logStream = (0, fs_1.createWriteStream)(logFilePath, { flags: 'a' });
    }
    log(message) {
        this.writeToStream(message);
    }
    writeToStream(message) {
        this.logStream.write(message);
    }
    createWritableStream() {
        return new stream_1.Writable({
            write: (chunk, encoding, callback) => {
                const message = chunk.toString();
                this.writeToStream(message);
                callback();
            },
        });
    }
}
exports.default = Logger;
