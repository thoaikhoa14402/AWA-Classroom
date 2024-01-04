import { NextFunction, Request, Response, Router } from "express";
import JsonWebToken from "../utils/jwt";
import OTPGenerator from "../utils/otp-generator";
import IController from "../interfaces/controller";
import catchAsync from "../utils/catch.error";
import DTOValidation from "../middlewares/validation.middleware";
import RegisterUserDTO from "../dtos/register-user.dto"
import LoginUserDTO from "../dtos/login-user.dto";
import UserModel, { IUser } from "../models/user.model";
import AppError from "../services/errors/app.error";
import passport from "passport";
import GMailer from '../services/mailer.builder';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';
import RenewPasswordDTO from "../dtos/renew-password.dto";

/*
 AUTH CONTROLLER 
1. LOGIN
2. REGISTER
3. FORGOT PASSWORD 
4. RESET PASSWORD 
*/

class AuthController implements IController {
    path: string = "/auth";
    router: Router = Router();

    constructor() {
        this.router.post('/login', DTOValidation.validate<LoginUserDTO>(LoginUserDTO, false),  this.isAuthenticated, catchAsync(this.login)) // if jwt are not set, handle login request
        this.router.get('/is-login', this.isAuthenticated, this.responseUnauthorizedMessage); // if jwt are expired, return unauthorized message to client
        this.router.post('/register', DTOValidation.validate<RegisterUserDTO>(RegisterUserDTO, true), catchAsync(this.register))
        this.router.post('/verify-user-registration', this.protect, catchAsync(this.verifyUserRegistration))
        this.router.post('/resend-otp', catchAsync(this.resendVerificationCodeViaEmail))
        // authentication with Google OAuth 2.0
        this.router.get('/google', this.isAuthenticated, passport.authenticate('google', {
            scope: ['profile', 'email'],
            successRedirect: 'https://awa-classroom-lecturer.vercel.app/v1/auth/google/cb',
        }))

        // google callback URL
        this.router.get('/google/cb', passport.authenticate('google', {session: false}), this.socialOAuthCallbackHandler) 
       
        // authentication with Facebook
        this.router.get('/facebook', this.isAuthenticated, passport.authenticate('facebook', {
            scope: ['public_profile', 'email']
        }))

        // facebook callback URL
        this.router.get('/facebook/cb', passport.authenticate('facebook', {session: false}), this.socialOAuthCallbackHandler) 

        // authentication with Github
        this.router.get('/github', this.isAuthenticated, passport.authenticate('github', {
            scope: ['public_profile', 'email']
        }))

        // facebook callback URL
        this.router.get('/github/cb', passport.authenticate('github', {session: false}), this.socialOAuthCallbackHandler) 
       
        // renew password
        this.router.post('/renew-password', DTOValidation.validate<RenewPasswordDTO>(RenewPasswordDTO, true), this.protect, catchAsync(this.renewPassword))

        // protected route
        this.router.get('/protect', this.protect, this.examplePrivateLogicHandler)
    }
    
    /// > LOGIN
    private login = async (req: Request, res: Response, next: NextFunction) => {
        const {username, password} = req.body
        const user = await UserModel.findOne({ username: username }).select('+password');

        if (!user || !(await user.correctPassword(password, user.password!)) || !user.active) {
            return next(new AppError('The username or password is incorrect!', 401));
        }

        if (user.role !== 'student') next(new AppError('The username or password is incorrect', 401));

        if (user && !user.verify) { // if this account is created, but not activated yet
            const otpCode = new OTPGenerator().generate();
            const verificationToken = await JsonWebToken.createToken({username: req.body.username, email: req.body.email, verification_code: otpCode}, {expiresIn: process.env.JWT_ACCESS_EXPIRES})
            const source = fs.readFileSync(path.join(__dirname, '../../templates/otpVerificationMailer/index.html'), 'utf8').toString();
            const template = handlebars.compile(source);
            const replacements = {
                username: req.body.username,
                verificationCode: otpCode
            };

            const htmlToSend = template(replacements);

            await GMailer.sendMail({
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
            })
            // return next(new AppError('This account has not been activated yet. Please active now!', 403));
        }

        let clonedUser = JSON.parse(JSON.stringify(user));
        delete clonedUser.password;

        const accessToken = await JsonWebToken.createToken({_id: user.id}, {expiresIn: process.env.JWT_ACCESS_EXPIRES})

        return res.status(200).json({
            message: "Login successfully!",
            user: clonedUser,
            accessToken: accessToken
        })
    }

    /// > REGISTER
    private register = async (req: Request, res: Response, next: NextFunction) => {
        const userRegisterInfo = req.body as RegisterUserDTO
        const foundedUser = await UserModel.findOne({ username: userRegisterInfo.username });

        if (foundedUser)
            return next(new AppError('This username is already in use!', 400));

        const newUser = await UserModel.create({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            passwordConfirm: req.body.passwordConfirm
        })

        const otpCode = new OTPGenerator().generate();
        const verificationToken = await JsonWebToken.createToken({username: req.body.username, email: req.body.email, verification_code: otpCode}, {expiresIn: process.env.JWT_ACCESS_EXPIRES})
        const source = fs.readFileSync(path.join(__dirname, '../../templates/otpVerificationMailer/index.html'), 'utf8').toString();
        const template = handlebars.compile(source);
        const replacements = {
            username: req.body.username,
            verificationCode: otpCode
          };
        const htmlToSend = template(replacements);
        
        await GMailer.sendMail({
            to: req.body.email,
            subject: 'Verify your account',
            html: htmlToSend,
        });

        res.status(200).json({
            message: "Your register information is valid.",
            verificationToken: verificationToken,
        })
       
    }

    /// > VERIFY USER REGISTER, IF VALID CREATE NEW ACCOUNT
    private verifyUserRegistration = async (req: Request, res: Response, next: NextFunction) => {
        const userRegistrationInfo = req.body;
        if (userRegistrationInfo.verification_code === req.verification_code) {
            const updatedUser = await UserModel.findOneAndUpdate(
                { username: req.body.username}, // Tìm người dùng dựa trên username
                { verify: true }, // Update trường verify thành true
                { new: true } // Tùy chọn này trả về đối tượng đã được cập nhật
            );
            const accessToken = await JsonWebToken.createToken({_id: updatedUser?.id}, {expiresIn: process.env.JWT_ACCESS_EXPIRES})
            return res.status(200).json({
                message: "Register successfully",
                user: updatedUser,
                accessToken: accessToken
            })
        }
        else  {
            return res.status(401).json({
                message: "Your verification code is not valid, try again!"
            })
        }
    }

     /// > RESEND OTP
    private resendVerificationCodeViaEmail = async (req: Request, res: Response, next: NextFunction) => {
        // check if username exists
        const foundedUsername = await UserModel.findOne({ username: req.body.username });

        if (!foundedUsername || !(foundedUsername.email === req.body.email)) {
            return res.status(401).json({
                message: "This username or email does not exist!"
            })
        }

        const otpCode = new OTPGenerator().generate();
        const verificationToken = await JsonWebToken.createToken({username: req.body.username, email: req.body.email, verification_code: otpCode}, {expiresIn: process.env.JWT_ACCESS_EXPIRES})
        const source = fs.readFileSync(path.join(__dirname, '../../templates/otpVerificationMailer/index.html'), 'utf8').toString();
        const template = handlebars.compile(source);
        const replacements = {
            username: req.body.username,
            verificationCode: otpCode
          };
        const htmlToSend = template(replacements);
        await GMailer.sendMail({
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
        })
    }
  
    /// > LOGIN BY SOCIAL OAUTH
    private socialOAuthCallbackHandler = async (req: Request, res: Response, next: NextFunction) => {
        const accessToken = await JsonWebToken.createToken({_id: req.user?.id}, {expiresIn: process.env.JWT_ACCESS_EXPIRES})
        res.redirect(`${process.env.CLIENT_HOST}/auth/login/?u_id=${req.user?.id}&access_token=${accessToken}`);
    }

    /// > PROTECT
    public protect = (req: Request, res: Response, next: NextFunction) => {
        passport.authenticate('jwt', {session: false}, (err: Error, user: IUser, info: any) => {
            if (!req.verification_code && user.role !== 'student') next(new AppError('The username or password is incorrect', 401)); // restrict user when activating account if conditions are not valid
            if (info instanceof Error) return next(info);
            next();
        })(req, res, next);
    }

    /// >  RESPONSE ACCESS TOKEN STATUS
    private responseUnauthorizedMessage = (req: Request, res: Response, next: NextFunction) => {
        return res.status(401).json({
            message: "This account has not been authenticated!"
        })
    }

    /// > CHECK AUTH
    private isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
        passport.authenticate('jwt', {session: false}, (err: Error, user: IUser, info: any) => {
            const origin = req.get('origin'); 
            // res.redirect only works with request from browser (<a href = ></a>, ...), and it does not contain 'origin' field
            // res.redirect and can not be worked with Axios because Axios is HTTP client not browser, and can not redirect by itself.
            // When using Axios, it will automatically add 'origin' field into request headers
            if (user) {
                if (user.role !== 'student') next(new AppError('Unauthorized', 401));
                if (!user.active) next(new AppError('The username or password is incorrect', 401)); // if user is not active (banned by admin)
                if (origin) { // from HTTP client 
                    return res.status(200).json({ message: "This account has been authenticated!" })
                }
                return res.redirect(`${process.env.CLIENT_HOST}/home`)
            }   
            next();
        })(req, res, next);
    }

    /// > RENEW PASSWORD
    private renewPassword = async (req: Request, res: Response, next: NextFunction) => {
        const user = req.body as RenewPasswordDTO;
        // get user from collection 
        const foundedUser = await UserModel.findOne({username: req.body.username}).select('+password');
        // check user exists
        if (!foundedUser) {
            return res.status(401).json({
                message: "This username does not exist!"
            }) 
        }
        // if user exists, update new password
        foundedUser.password = user.newPassword;
        foundedUser.passwordChangedAt = Date.now() - 1000;
        await foundedUser.save();

        // delete password field of user to send back to client
        let clonedUser = JSON.parse(JSON.stringify(foundedUser));
        delete clonedUser.password;

        const accessToken = await JsonWebToken.createToken({_id: foundedUser.id}, {expiresIn: process.env.JWT_ACCESS_EXPIRES})

        return res.status(200).json({
            message: "Change password successfully!",
            user: clonedUser,
            accessToken: accessToken
        })
    }

    /// > EXAMPLE PRIVATE LOGIC HANDLER (used for testing purposes)
    private examplePrivateLogicHandler = (req: Request, res: Response, next: NextFunction) => {
        // handle your business logic here. (assume that JWT has been verified in the protect middleware)
        return res.status(200).json({
            message: "Passed through protect middleware successfully",
            // YOUR DATA 
        })
    }
}

export default new AuthController();