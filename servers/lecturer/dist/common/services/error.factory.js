"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_error_1 = __importDefault(require("../services/errors/app.error"));
class ErrorFactory {
    constructor(error) {
        this.error = error;
        this.error.statusCode = this.error.statusCode || 500;
        this.error.status = this.error.status || 'error';
    }
    createError() {
        return new app_error_1.default(this.error.message, this.error.statusCode);
    }
    handler(callback) {
        const error = this.createError();
        const err_response = {
            status: error.isOperational ? error.status : 'error',
            statusCode: error.isOperational ? error.statusCode : 500,
            message: error.isOperational ? error.message : 'Something went wrong!',
        };
        if (process.env.NODE_ENV === 'development') {
            err_response.statusCode = error.statusCode;
            err_response.message = error.message;
            err_response.stack = error.stack;
            console.error(error);
        }
        callback(err_response);
    }
}
exports.default = ErrorFactory;
