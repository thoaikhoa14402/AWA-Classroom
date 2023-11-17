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
/*
 USER CONTROLLER
1. GET PROFILE
2. UPDATE PROFILE
3. UPLOAD AVATAR
*/
class UserController {
    profileCacheKey(req) {
        return `profile?id=${req.user.id}`;
    }
    constructor() {
        this.path = "/user";
        this.router = (0, express_1.Router)();
        /// > GET PROFILE
        this.getProfile = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            return res.status(200).json({
                status: 'success',
                data: req.user
            });
        });
        /// > UPDATE PROFILE
        this.updateProfile = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const newProfile = req.body;
            const updatedProfile = yield user_model_1.default.findByIdAndUpdate(req.user.id, newProfile, { new: true, runValidators: true });
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
            return res.status(200).json({
                status: 'success',
                data: req.cloudinaryResult
            });
        });
        this.getProfileById = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const userId = req.params.id;
            const user = yield user_model_1.default.findById(userId);
            return res.status(200).json({
                message: "success",
                user: user,
            });
        });
        this.router.get('/profile', _1.AuthController.protect, (0, cache_middleware_1.default)(this.profileCacheKey), (0, catch_error_1.default)(this.getProfile));
        this.router.patch('/profile', validation_middleware_1.default.validate(update_profile_dto_1.default), _1.AuthController.protect, (0, catch_error_1.default)(this.updateProfile));
        const multercloud = new multer_1.default(['jpg', 'jpeg', 'png'], 1 * 1024 * 1024);
        this.router.put('/upload', _1.AuthController.protect, multercloud.single('avatar'), multercloud.uploadCloud('avatars'), (0, catch_error_1.default)(this.uploadAvatar));
        this.router.get('/:id', _1.AuthController.protect, (0, catch_error_1.default)(this.getProfileById));
    }
}
exports.default = new UserController();
