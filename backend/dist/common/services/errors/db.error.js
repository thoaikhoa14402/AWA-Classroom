"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = exports.DuplicateFieldsError = exports.CastError = void 0;
const error_factory_1 = __importDefault(require("../../services/error.factory"));
const app_error_1 = __importDefault(require("../../services/errors/app.error"));
class CastError extends error_factory_1.default {
    createError() {
        return new app_error_1.default(`Invalid ${this.error.path}: ${this.error.value}.`, 400);
    }
}
exports.CastError = CastError;
class DuplicateFieldsError extends error_factory_1.default {
    createError() {
        const value = this.error.errmsg.match(/(["'])(\\?.)*?\1/)[0];
        return new app_error_1.default(`Duplicate field value: ${value}. Please use another value.`, 400);
    }
}
exports.DuplicateFieldsError = DuplicateFieldsError;
class ValidationError extends error_factory_1.default {
    createError() {
        const errors = Object.values(this.error.errors).map((el) => el.message);
        const message = `Invalid input data. ${errors.join(' ')}`;
        return new app_error_1.default(message, 400);
    }
}
exports.ValidationError = ValidationError;
