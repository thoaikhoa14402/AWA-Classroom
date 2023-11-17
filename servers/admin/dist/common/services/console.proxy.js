"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const logger_1 = __importDefault(require("../utils/logger"));
class ConsoleProxyHandler {
    constructor() {
        this.originalConsole = console;
    }
    get(target, prop) {
        if (prop === 'log') {
            return (...args) => {
                const timestamp = `[${new Date().toLocaleString('en-US', {
                    timeZone: 'Asia/Ho_Chi_Minh',
                    weekday: 'long',
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                    hour12: true,
                })}]`;
                const modifiedArgs = [chalk_1.default.blue(`[${process.env.APP_NAME}]${chalk_1.default.yellow(timestamp)}`), ...args];
                const message = [`[${process.env.APP_NAME}]${timestamp}`, ...args, '\r\n'].join(' ');
                new logger_1.default('./logs/activity.log').log(message);
                target.log.apply(this.originalConsole, modifiedArgs);
            };
        }
        else if (prop === 'error') {
            return (...args) => {
                const timestamp = `[${new Date().toLocaleString('en-US', {
                    timeZone: 'Asia/Ho_Chi_Minh',
                    weekday: 'long',
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                    hour12: true,
                })}]`;
                const outputMessage = args;
                const modifiedArgs = [
                    chalk_1.default.blue(`[${process.env.APP_NAME}]${chalk_1.default.yellow(timestamp)}`),
                    chalk_1.default.red(...args),
                ];
                const message = [`[${process.env.APP_NAME}]${timestamp}`, ...args, '\r\n'].join(' ');
                new logger_1.default('./logs/error.log').log(message);
                target.log.apply(this.originalConsole, modifiedArgs);
                if (process.env.NODE_ENV === 'development') {
                    console.log(...outputMessage);
                }
            };
        }
        return Reflect.get(target, prop);
    }
}
exports.default = ConsoleProxyHandler;
