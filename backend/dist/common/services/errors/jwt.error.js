"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWTExpiredError = exports.JWTError = void 0;
const error_factory_1 = __importDefault(require("../../services/error.factory"));
const app_error_1 = __importDefault(require("../../services/errors/app.error"));
class JWTError extends error_factory_1.default {
    createError() {
        return new app_error_1.default('Invalid token. Please log in again!', 401);
    }
}
exports.JWTError = JWTError;
class JWTExpiredError extends error_factory_1.default {
    createError() {
        return new app_error_1.default('Your token has expired! Please log in again.', 401);
    }
}
exports.JWTExpiredError = JWTExpiredError;
