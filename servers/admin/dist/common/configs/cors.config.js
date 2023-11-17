"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const whitelist_origins_1 = __importDefault(require("../constants/whitelist.origins"));
const app_error_1 = __importDefault(require("../services/errors/app.error"));
const CorsCustomOptions = {
    origin: (origin, callback) => {
        if (whitelist_origins_1.default.length === 0 || whitelist_origins_1.default.indexOf(origin) !== -1 || !origin)
            callback(null, true);
        else
            callback(new app_error_1.default('Not allowed by CORS', 401));
    },
    optionsSuccessStatus: 200,
};
exports.default = CorsCustomOptions;
