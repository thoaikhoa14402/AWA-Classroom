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
const express_1 = require("express");
const jwt_1 = __importDefault(require("../utils/jwt"));
const otp_generator_1 = __importDefault(require("../utils/otp-generator"));
const catch_error_1 = __importDefault(require("../utils/catch.error"));
const validation_middleware_1 = __importDefault(require("../middlewares/validation.middleware"));
const register_user_dto_1 = __importDefault(require("../dtos/register-user.dto"));
const login_user_dto_1 = __importDefault(require("../dtos/login-user.dto"));
const user_model_1 = __importDefault(require("../models/user.model"));
const app_error_1 = __importDefault(require("../services/errors/app.error"));
const passport_1 = __importDefault(require("passport"));
const mailer_builder_1 = __importDefault(require("../services/mailer.builder"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const handlebars = __importStar(require("handlebars"));
const renew_password_dto_1 = __importDefault(require("../dtos/renew-password.dto"));
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
            if (!user || !(yield user.correctPassword(password, user.password))) {
                return next(new app_error_1.default('The username or password is incorrect!', 401));
            }
            if (user.role !== 'lecturer')
                next(new app_error_1.default('The username or password is incorrect', 401));
            if (user && !user.verify) { // if this account is created, but not activated yet
                const otpCode = new otp_generator_1.default().generate();
                const verificationToken = yield jwt_1.default.createToken({ username: req.body.username, email: req.body.email, verification_code: otpCode }, { expiresIn: process.env.JWT_ACCESS_EXPIRES });
                const source = fs.readFileSync(path.join(__dirname, '../../templates/otpVerificationMailer/index.html'), 'utf8').toString();
                const template = handlebars.compile(source);
                const replacements = {
                    username: req.body.username,
                    verificationCode: otpCode
                };
                const htmlToSend = template(replacements);
                yield mailer_builder_1.default.sendMail({
                    to: user.email,
                    subject: 'Verify your account',
                    html: htmlToSend,
                });
                return res.status(403).json({
                    message: "This account has not been activated yet. Please active now!",
                    user: {
                        username: user.username,
                        email: user.email,
                    },
                    verificationToken: verificationToken
                });
                // return next(new AppError('This account has not been activated yet. Please active now!', 403));
            }
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
                return next(new app_error_1.default('This username is already in use!', 400));
            const newUser = yield user_model_1.default.create({
                username: req.body.username,
                email: req.body.email,
                password: req.body.password,
                passwordConfirm: req.body.passwordConfirm
            });
            const otpCode = new otp_generator_1.default().generate();
            const verificationToken = yield jwt_1.default.createToken({ username: req.body.username, email: req.body.email, verification_code: otpCode }, { expiresIn: process.env.JWT_ACCESS_EXPIRES });
            const source = fs.readFileSync(path.join(__dirname, '../../templates/otpVerificationMailer/index.html'), 'utf8').toString();
            const template = handlebars.compile(source);
            const replacements = {
                username: req.body.username,
                verificationCode: otpCode
            };
            const htmlToSend = template(replacements);
            yield mailer_builder_1.default.sendMail({
                to: req.body.email,
                subject: 'Verify your account',
                html: htmlToSend,
            });
            res.status(200).json({
                message: "Your register information is valid.",
                verificationToken: verificationToken,
            });
        });
        /// > VERIFY USER REGISTER, IF VALID CREATE NEW ACCOUNT
        this.verifyUserRegistration = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const userRegistrationInfo = req.body;
            if (userRegistrationInfo.verification_code === req.verification_code) {
                const updatedUser = yield user_model_1.default.findOneAndUpdate({ username: req.body.username }, // Tìm người dùng dựa trên username
                { verify: true }, // Update trường active thành true
                { new: true } // Tùy chọn này trả về đối tượng đã được cập nhật
                );
                const accessToken = yield jwt_1.default.createToken({ _id: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.id }, { expiresIn: process.env.JWT_ACCESS_EXPIRES });
                return res.status(200).json({
                    message: "Register successfully",
                    user: updatedUser,
                    accessToken: accessToken
                });
            }
            else {
                return res.status(401).json({
                    message: "Your verification code is not valid, try again!"
                });
            }
        });
        /// > RESEND OTP
        this.resendVerificationCodeViaEmail = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            // check if username exists
            const foundedUsername = yield user_model_1.default.findOne({ username: req.body.username });
            if (!foundedUsername || !(foundedUsername.email === req.body.email)) {
                return res.status(401).json({
                    message: "This username or email does not exist!"
                });
            }
            const otpCode = new otp_generator_1.default().generate();
            const verificationToken = yield jwt_1.default.createToken({ username: req.body.username, email: req.body.email, verification_code: otpCode }, { expiresIn: process.env.JWT_ACCESS_EXPIRES });
            const source = fs.readFileSync(path.join(__dirname, '../../templates/otpVerificationMailer/index.html'), 'utf8').toString();
            const template = handlebars.compile(source);
            const replacements = {
                username: req.body.username,
                verificationCode: otpCode
            };
            const htmlToSend = template(replacements);
            yield mailer_builder_1.default.sendMail({
                to: req.body.email,
                subject: 'Verify your account',
                html: htmlToSend,
            });
            return res.status(200).json({
                message: "We've sent a new verification code to your email.",
                verificationToken: verificationToken,
                user: {
                    username: req.body.username,
                    email: req.body.email,
                }
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
                if (!req.verification_code && user.role !== 'lecturer')
                    next(new app_error_1.default('The username or password is incorrect', 401));
                if (info instanceof Error)
                    return next(info);
                next();
            })(req, res, next);
        };
        /// >  RESPONSE ACCESS TOKEN STATUS
        this.responseUnauthorizedMessage = (req, res, next) => {
            return res.status(401).json({
                message: "This account has not been authenticated!"
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
                    if (user.role !== 'lecturer')
                        next(new app_error_1.default('Unauthorized', 401));
                    if (origin) { // from HTTP client 
                        return res.status(200).json({ message: "This account has been authenticated!" });
                    }
                    return res.redirect(`${process.env.CLIENT_HOST}/home`);
                }
                next();
            })(req, res, next);
        };
        /// > RENEW PASSWORD
        this.renewPassword = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const user = req.body;
            // get user from collection 
            const foundedUser = yield user_model_1.default.findOne({ username: req.body.username }).select('+password');
            // check user exists
            if (!foundedUser) {
                return res.status(401).json({
                    message: "This username does not exist!"
                });
            }
            // if user exists, update new password
            foundedUser.password = user.newPassword;
            foundedUser.passwordChangedAt = Date.now() - 1000;
            yield foundedUser.save();
            // delete password field of user to send back to client
            let clonedUser = JSON.parse(JSON.stringify(foundedUser));
            delete clonedUser.password;
            const accessToken = yield jwt_1.default.createToken({ _id: foundedUser.id }, { expiresIn: process.env.JWT_ACCESS_EXPIRES });
            return res.status(200).json({
                message: "Change password successfully!",
                user: clonedUser,
                accessToken: accessToken
            });
        });
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
        this.router.post('/verify-user-registration', this.protect, (0, catch_error_1.default)(this.verifyUserRegistration));
        this.router.post('/resend-otp', (0, catch_error_1.default)(this.resendVerificationCodeViaEmail));
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
        // renew password
        this.router.post('/renew-password', validation_middleware_1.default.validate(renew_password_dto_1.default, true), this.protect, (0, catch_error_1.default)(this.renewPassword));
        // protected route
        this.router.get('/protect', this.protect, this.examplePrivateLogicHandler);
    }
}
exports.default = new AuthController();
