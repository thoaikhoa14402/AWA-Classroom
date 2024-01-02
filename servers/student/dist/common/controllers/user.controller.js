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
const express_1 = require("express");
const catch_error_1 = __importDefault(require("../utils/catch.error"));
const _1 = require(".");
const cache_middleware_1 = __importDefault(require("../middlewares/cache.middleware"));
const multer_1 = __importDefault(require("../multer"));
const update_profile_dto_1 = __importDefault(require("../dtos/update-profile.dto"));
const validation_middleware_1 = __importDefault(require("../middlewares/validation.middleware"));
const user_model_1 = __importDefault(require("../models/user.model"));
const reset_password_dto_1 = __importDefault(require("../dtos/reset-password.dto"));
const app_error_1 = __importDefault(require("../services/errors/app.error"));
const redis_1 = __importDefault(require("../redis"));
const cloudinary_1 = __importDefault(require("../cloudinary"));
/*
 USER CONTROLLER
1. GET PROFILE
2. UPDATE PROFILE
3. UPLOAD AVATAR
4. RESET PASSWORD
*/
class UserController {
    profileCacheKey(req) {
        return `profile?id=${req.user.id}`;
    }
    profileAccountCacheKey(req) {
        return `profileById?id=${req.params.id}`;
    }
    constructor() {
        this.path = "/user";
        this.router = (0, express_1.Router)();
        /// > HANDLE RES CACHE
        this.profileCacheRes = (req, res, next, data) => __awaiter(this, void 0, void 0, function* () {
            return res.status(200).json({
                status: 'success',
                data: data
            });
        });
        this.profileCacheByIdRes = (req, res, next, data) => __awaiter(this, void 0, void 0, function* () {
            return res.status(200).json({
                status: 'success',
                user: data
            });
        });
        /// > GET PROFILE
        this.getProfile = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const redisClient = redis_1.default.getClient();
            yield (redisClient === null || redisClient === void 0 ? void 0 : redisClient.setEx(this.profileCacheKey(req), Number(process.env.REDIS_CACHE_EXPIRES), JSON.stringify(req.user)));
            return res.status(200).json({
                status: 'success',
                data: req.user
            });
        });
        /// > UPDATE PROFILE
        this.updateProfile = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const newProfile = req.body;
            const updatedProfile = yield user_model_1.default.findByIdAndUpdate(req.user.id, newProfile, { new: true, runValidators: true });
            const redisClient = redis_1.default.getClient();
            yield (redisClient === null || redisClient === void 0 ? void 0 : redisClient.del(this.profileCacheKey(req)));
            res.status(200).json({
                message: "update profile successfully",
                data: updatedProfile
            });
        });
        /// > UPLOAD AVATAR
        this.uploadAvatar = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            yield user_model_1.default.findByIdAndUpdate(req.user.id, {
                avatar: req.cloudinaryResult.secure_url || req.cloudinaryResult.url
            });
            const avatar = req.user.avatar;
            if (avatar === null || avatar === void 0 ? void 0 : avatar.includes('cloudinary')) {
                const matches = RegExp(/avatars\/[a-zA-Z0-9]+/).exec(avatar);
                yield cloudinary_1.default.delete([matches[0]]);
            }
            const redisClient = redis_1.default.getClient();
            yield (redisClient === null || redisClient === void 0 ? void 0 : redisClient.del(this.profileCacheKey(req)));
            return res.status(200).json({
                status: 'success',
                data: req.cloudinaryResult
            });
        });
        this.getProfileById = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const userId = req.params.id;
            const user = yield user_model_1.default.findById(userId);
            const redisClient = redis_1.default.getClient();
            yield (redisClient === null || redisClient === void 0 ? void 0 : redisClient.setEx(this.profileAccountCacheKey(req), Number(process.env.REDIS_CACHE_EXPIRES), JSON.stringify(user)));
            return res.status(200).json({
                message: "success",
                user: user,
            });
        });
        this.resetPassword = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const resetPassword = req.body;
            const user = yield user_model_1.default.findById(req.user.id).select("+password");
            const validPassword = yield (user === null || user === void 0 ? void 0 : user.correctPassword(resetPassword.currentPassword, user.password));
            if (user && validPassword) {
                user.password = resetPassword.newPassword;
                user.passwordChangedAt = Date.now() - 1000;
                yield user.save();
                return res.status(200).json({
                    message: "success",
                    data: null,
                });
            }
            next(new app_error_1.default("Password is not correct", 403));
        });
        this.router.get('/profile', _1.AuthController.protect, (0, cache_middleware_1.default)(this.profileCacheKey, this.profileCacheRes), (0, catch_error_1.default)(this.getProfile));
        this.router.patch('/profile', validation_middleware_1.default.validate(update_profile_dto_1.default), _1.AuthController.protect, (0, catch_error_1.default)(this.updateProfile));
        const multercloud = new multer_1.default(['jpg', 'jpeg', 'png'], 1 * 1024 * 1024);
        this.router.put('/upload', _1.AuthController.protect, multercloud.single('avatar'), multercloud.uploadCloud('avatars'), (0, catch_error_1.default)(this.uploadAvatar));
        this.router.get('/:id', _1.AuthController.protect, (0, cache_middleware_1.default)(this.profileAccountCacheKey, this.profileCacheByIdRes), (0, catch_error_1.default)(this.getProfileById));
        this.router.patch('/reset-password', _1.AuthController.protect, validation_middleware_1.default.validate(reset_password_dto_1.default), (0, catch_error_1.default)(this.resetPassword));
    }
}
exports.default = new UserController();
