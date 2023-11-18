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
            scope: ['profile', 'email']
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
       
        // protected route
        this.router.get('/protect', this.protect, this.examplePrivateLogicHandler)
    }
    
    /// > LOGIN
    private login = async (req: Request, res: Response, next: NextFunction) => {
        const {username, password} = req.body
        const user = await UserModel.findOne({ username: username }).select('+password');
        
        if (!user || !(await user.correctPassword(password, user.password!)) || !user.active) {
            return next(new AppError('Tài khoản hoặc mật khẩu không chính xác', 401));
        }
        let clonedUser = JSON.parse(JSON.stringify(user));
        delete clonedUser.password;

        const accessToken = await JsonWebToken.createToken({_id: user.id}, {expiresIn: process.env.JWT_ACCESS_EXPIRES})

        return res.status(200).json({
            message: "Đăng nhập thành công!",
            user: clonedUser,
            accessToken: accessToken
        })
    }

    /// > REGISTER
    private register = async (req: Request, res: Response, next: NextFunction) => {
        const userRegisterInfo = req.body as RegisterUserDTO
        const foundedUser = await UserModel.findOne({ username: userRegisterInfo.username });

        if (foundedUser)
            return next(new AppError('Tài khoản đã tồn tại', 400));

        // const newUser = await UserModel.create({
        //     username: req.body.username,
        //     email: req.body.email,
        //     password: req.body.password,
        //     passwordConfirm: req.body.passwordConfirm
        // })
        // let clonedUser = JSON.parse(JSON.stringify(newUser));
        // delete clonedUser.password;

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
            message: "Register information is valid!",
            verificationToken: verificationToken,
            otp: otpCode,
        })
        // const accessToken = await JsonWebToken.createToken({_id: newUser.id}, {expiresIn: process.env.JWT_ACCESS_EXPIRES})
        
        // return res.status(200).json({
        //     message: "Đăng ký thành công!",
        //     user: clonedUser,
        //     accessToken: accessToken
        // })
    }

    /// > VERIFY USER REGISTER, IF VALID CREATE NEW ACCOUNT
    private verifyUserRegistration = async (req: Request, res: Response, next: NextFunction) => {
        const userRegistrationInfo = req.body;
        console.log('extracted verification code: ', req.verification_code);
        console.log('req.body: ', req.body);
        if (userRegistrationInfo.verification_code === req.verification_code) {
            return res.status(200).json({
                message: "Your verification code is valid"
            })
        }
        else  {
            console.log('wrong verification code');
            return res.status(401).json({
                message: "Your verification code is not valid, try again!"
            })
        }
    }

     /// > RESEND OTP
     private resendVerificationCodeViaEmail = async (req: Request, res: Response, next: NextFunction) => {
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
            if (info instanceof Error) return next(info);
            next();
        })(req, res, next);
    }

    /// >  RESPONSE ACCESS TOKEN STATUS
    private responseUnauthorizedMessage = (req: Request, res: Response, next: NextFunction) => {
        return res.status(401).json({
            message: "Tài khoản chưa được xác thực!"
        })
    }

    /// > CHECK AUTH
    private isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
        passport.authenticate('jwt', {session: false}, (err: Error, user: IUser, info: any) => {
            const origin = req.get('origin'); 
            // res.redirect only works with request from browser (<a href = ></a>, ...), and it does not contain 'origin' field
            // res.redirect and can not be worked with Axios because Axios is HTTP client not browser, and can not redirect by itself.
            // When using Axios, it will automatically add 'origin' field into request headers
            if (user._id) {
                if (origin) { // from HTTP client 
                    return res.status(200).json({ message: "Tài khoản đã được xác thực!" })
                }
                return res.redirect(`${process.env.CLIENT_HOST}/home`)
            }
            next();
        })(req, res, next);
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