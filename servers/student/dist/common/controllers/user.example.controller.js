"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const mongoose_1 = __importDefault(require("mongoose"));
const express_1 = require("express");
const user_example_model_1 = __importDefault(require("../models/user.example.model"));
const catch_error_1 = __importDefault(require("../utils/catch.error"));
const validation_middleware_1 = __importDefault(require("../middlewares/validation.middleware"));
const user_example_dto_1 = __importDefault(require("../dtos/user.example.dto"));
const jwt_1 = __importStar(require("../utils/jwt"));
const mailer_builder_1 = __importDefault(require("../services/mailer.builder"));
const redis_1 = __importDefault(require("../redis"));
const multer_1 = __importDefault(require("../multer"));
class UserController {
    static profileCacheKey(req) {
        return `profile?id=${req.params.id}`;
    }
    constructor() {
        this.path = '/user';
        this.router = (0, express_1.Router)();
        // dto example
        this.router.post('/', validation_middleware_1.default.validate(user_example_dto_1.default), (0, catch_error_1.default)(this.createUser));
        // extract 1 param example
        this.router.param('id', validation_middleware_1.default.extractParams(['id']));
        // cache example
        // this.router.get('/:id', cacheMiddleware(UserController.profileCacheKey), catchAsync(this.getUser));
        // extract params example
        this.router.get('/details/:id/:idx', validation_middleware_1.default.extractParams(['id', 'idx']), (0, catch_error_1.default)(this.getUser));
        // upload file example
        const multercloud = new multer_1.default(['jpg', 'jpeg', 'png', 'gif'], 5 * 1024 * 1024);
        this.router.post('/upload', multercloud.single('image'), multercloud.uploadCloud('uploads'), (0, catch_error_1.default)(this.uploadFile));
    }
    createUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // test dto validation.
            const userInfo = req.body;
            console.log(userInfo);
            // c1
            // test jwt.
            console.log("C1----------------------------------------------------------------");
            const jwt = new jwt_1.JsonWebToken('this is my secret key');
            const token = yield jwt.createToken(userInfo, { expiresIn: process.env.JWT_REFRESH_EXPIRES });
            console.log(token);
            const payload = yield jwt.verifyToken(token);
            console.log(payload);
            // c2
            console.log("C2----------------------------------------------------------------");
            const token2 = yield jwt_1.default.createToken(userInfo, { expiresIn: process.env.JWT_REFRESH_EXPIRES });
            console.log(token2);
            const payload2 = yield jwt_1.default.verifyToken(token2);
            console.log(payload2);
            // sendmail example
            yield mailer_builder_1.default.sendMail({
                to: userInfo.email,
                subject: 'Test send mail',
                html: '<h1>Hello World!</h1>',
            });
            // test error handler.
            const users = yield user_example_model_1.default.create(userInfo);
            return res.status(200).json(users);
        });
    }
    getUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // test extract params
            console.log(req.body.id);
            console.log(req.body.idx);
            req.user = {
                _id: new mongoose_1.default.Types.ObjectId(123123),
                firstname: '123',
                lastname: '123',
                password: '123',
                email: '123',
            };
            // cache
            const redisClient = redis_1.default.getClient();
            yield (redisClient === null || redisClient === void 0 ? void 0 : redisClient.setEx(UserController.profileCacheKey(req), Number(process.env.REDIS_CACHE_EXPIRES), JSON.stringify(req.user)));
            return res.status(200).json({ message: req.user });
        });
    }
    uploadFile(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // test multer
            console.log(req.file);
            console.log(req.cloudinaryResult);
            return res.status(200).json({ message: 'ok' });
        });
    }
}
exports.default = new UserController();
