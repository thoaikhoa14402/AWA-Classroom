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
const jwt_1 = __importDefault(require("../utils/jwt"));
const catch_error_1 = __importDefault(require("../utils/catch.error"));
const validation_middleware_1 = __importDefault(require("../middlewares/validation.middleware"));
const register_user_dto_1 = __importDefault(require("../dtos/register-user.dto"));
const login_user_dto_1 = __importDefault(require("../dtos/login-user.dto"));
const user_model_1 = __importDefault(require("../models/user.model"));
const app_error_1 = __importDefault(require("../services/errors/app.error"));
const passport_1 = __importDefault(require("passport"));
/*
 AUTH CONTROLLER
1. LOGIN
2. REGISTER
3. FORGOT PASSWORD
4. RESET PASSWORD
*/
class AuthController {
    constructor() {
        this.path = "/auth";
        this.router = (0, express_1.Router)();
        /// > LOGIN
        this.login = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { username, password } = req.body;
            const user = yield user_model_1.default.findOne({ username: username }).select('+password');
            if (!user || !(yield user.correctPassword(password, user.password)) || !user.active) {
                return next(new app_error_1.default('The username or password is incorrect!', 401));
            }
            if (user.role !== 'admin')
                next(new app_error_1.default('The username or password is incorrect!', 401));
            let clonedUser = JSON.parse(JSON.stringify(user));
            delete clonedUser.password;
            const accessToken = yield jwt_1.default.createToken({ _id: user.id }, { expiresIn: process.env.JWT_ACCESS_EXPIRES });
            return res.status(200).json({
                message: "Login successfully!",
                user: clonedUser,
                accessToken: accessToken
            });
        });
        /// > REGISTER
        this.register = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const userRegisterInfo = req.body;
            const foundedUser = yield user_model_1.default.findOne({ username: userRegisterInfo.username });
            if (foundedUser)
                return next(new app_error_1.default('Tài khoản đã tồn tại', 400));
            const newUser = yield user_model_1.default.create({
                username: req.body.username,
                email: req.body.email,
                password: req.body.password,
                passwordConfirm: req.body.passwordConfirm
            });
            let clonedUser = JSON.parse(JSON.stringify(newUser));
            delete clonedUser.password;
            const accessToken = yield jwt_1.default.createToken({ _id: newUser.id }, { expiresIn: process.env.JWT_ACCESS_EXPIRES });
            return res.status(200).json({
                message: "Register successfully!",
                user: clonedUser,
                accessToken: accessToken
            });
        });
        /// > LOGIN BY SOCIAL OAUTH
        this.socialOAuthCallbackHandler = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const accessToken = yield jwt_1.default.createToken({ _id: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id }, { expiresIn: process.env.JWT_ACCESS_EXPIRES });
            res.redirect(`${process.env.CLIENT_HOST}/auth/login/?u_id=${(_b = req.user) === null || _b === void 0 ? void 0 : _b.id}&access_token=${accessToken}`);
        });
        /// > PROTECT
        this.protect = (req, res, next) => {
            passport_1.default.authenticate('jwt', { session: false }, (err, user, info) => {
                if (info instanceof Error)
                    return next(info);
                next();
            })(req, res, next);
        };
        /// >  RESPONSE ACCESS TOKEN STATUS
        this.responseUnauthorizedMessage = (req, res, next) => {
            return res.status(401).json({
                message: "Tài khoản chưa được xác thực!"
            });
        };
        /// > CHECK AUTH
        this.isAuthenticated = (req, res, next) => {
            passport_1.default.authenticate('jwt', { session: false }, (err, user, info) => {
                const origin = req.get('origin');
                // res.redirect only works with request from browser (<a href = ></a>, ...), and it does not contain 'origin' field
                // res.redirect and can not be worked with Axios because Axios is HTTP client not browser, and can not redirect by itself.
                // When using Axios, it will automatically add 'origin' field into request headers
                if (user) {
                    if (user.role !== 'admin')
                        next(new app_error_1.default('Unauthorized', 401));
                    if (origin) { // from HTTP client 
                        return res.status(200).json({ message: "This account has been authenticated!" });
                    }
                    return res.redirect(`${process.env.CLIENT_HOST}/dashboard`);
                }
                next();
            })(req, res, next);
        };
        /// > EXAMPLE PRIVATE LOGIC HANDLER (used for testing purposes)
        this.examplePrivateLogicHandler = (req, res, next) => {
            // handle your business logic here. (assume that JWT has been verified in the protect middleware)
            return res.status(200).json({
                message: "Passed through protect middleware successfully",
                // YOUR DATA 
            });
        };
        this.router.post('/login', validation_middleware_1.default.validate(login_user_dto_1.default, false), this.isAuthenticated, (0, catch_error_1.default)(this.login)); // if jwt are not set, handle login request
        this.router.get('/is-login', this.isAuthenticated, this.responseUnauthorizedMessage); // if jwt are expired, return unauthorized message to client
        this.router.post('/register', validation_middleware_1.default.validate(register_user_dto_1.default, true), (0, catch_error_1.default)(this.register));
        // authentication with Google OAuth 2.0
        this.router.get('/google', this.isAuthenticated, passport_1.default.authenticate('google', {
            scope: ['profile', 'email']
        }));
        // google callback URL
        this.router.get('/google/cb', passport_1.default.authenticate('google', { session: false }), this.socialOAuthCallbackHandler);
        // authentication with Facebook
        this.router.get('/facebook', this.isAuthenticated, passport_1.default.authenticate('facebook', {
            scope: ['public_profile', 'email']
        }));
        // facebook callback URL
        this.router.get('/facebook/cb', passport_1.default.authenticate('facebook', { session: false }), this.socialOAuthCallbackHandler);
        // authentication with Github
        this.router.get('/github', this.isAuthenticated, passport_1.default.authenticate('github', {
            scope: ['public_profile', 'email']
        }));
        // facebook callback URL
        this.router.get('/github/cb', passport_1.default.authenticate('github', { session: false }), this.socialOAuthCallbackHandler);
        // protected route
        this.router.get('/protect', this.protect, this.examplePrivateLogicHandler);
    }
}
exports.default = new AuthController();
