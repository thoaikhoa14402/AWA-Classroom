"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const error_factory_1 = __importDefault(require("../services/error.factory"));
const db_error_1 = require("../services/errors/db.error");
const jwt_error_1 = require("../services/errors/jwt.error");
const ErrorMiddleware = (error, req, res, next) => {
    let factory = new error_factory_1.default(error);
    if (error.name === 'CastError')
        factory = new db_error_1.CastError(error);
    else if (error.code === 11000)
        factory = new db_error_1.DuplicateFieldsError(error);
    else if (error.name === 'ValidationError')
        factory = new db_error_1.ValidationError(error);
    else if (error.name === 'JsonWebTokenError')
        factory = new jwt_error_1.JWTError(error);
    else if (error.name === 'TokenExpiredError')
        factory = new jwt_error_1.JWTExpiredError(error);
    factory.handler((error_reponse) => {
        res.status(error_reponse.statusCode).json(error_reponse);
    });
};
exports.default = ErrorMiddleware;
