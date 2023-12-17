"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const cors_config_1 = __importDefault(require("./configs/cors.config"));
class SocketIO {
    constructor() {
        this.io = null;
    }
    static getInstance() {
        var _a;
        return (_a = this.instance) !== null && _a !== void 0 ? _a : (this.instance = new this());
    }
    init(httpServer, options) {
        var _a;
        return (_a = this.io) !== null && _a !== void 0 ? _a : (this.io = new socket_io_1.Server(httpServer, Object.assign({ cors: cors_config_1.default, transports: ['polling', 'websocket'], allowEIO3: true }, options)));
    }
    getIO() {
        if (!this.io) {
            throw new Error('Socket instance not initialized');
        }
        return this.io;
    }
}
const socketIO = SocketIO.getInstance();
exports.default = socketIO;
