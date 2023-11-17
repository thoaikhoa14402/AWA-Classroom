"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const app_error_1 = __importDefault(require("../services/errors/app.error"));
class DTOValidation {
    static extractParams(params) {
        return (request, response, next) => {
            params.forEach((key) => {
                if (request.params[key]) {
                    request.body[key] = request.params[key];
                }
            });
            return next();
        };
    }
    ;
    static validate(dto, skipMissingProperties = false) {
        return (request, response, next) => {
            const instance = (0, class_transformer_1.plainToInstance)(dto, request.body);
            (0, class_validator_1.validate)(instance, {
                skipMissingProperties,
                whitelist: true,
            }).then((errors) => {
                if (errors.length > 0) {
                    const message = errors
                        .map((error) => Object.values(error.constraints))
                        .join(',').replace(/,/g, '. ');
                    return next(new app_error_1.default(message, 400));
                }
                request.body = instance;
                return next();
            });
        };
    }
    ;
}
exports.default = DTOValidation;
