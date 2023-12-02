"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = __importDefault(require("../redis"));
const app_error_1 = __importDefault(require("../services/errors/app.error"));
const cacheMiddleware = (keyGetter, callback) => {
    return (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const redisClient = redis_1.default.getClient();
            const key = keyGetter(request);
            if (!key || !redisClient)
                return next();
            const cachedResponse = yield (redisClient === null || redisClient === void 0 ? void 0 : redisClient.get(key));
            if (cachedResponse) {
                return callback(request, response, next, JSON.parse(cachedResponse));
            }
            return next();
        }
        catch (error) {
            console.error(error);
            return next(new app_error_1.default('Error on cache middleware', 500));
        }
    });
};
exports.default = cacheMiddleware;
