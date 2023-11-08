import { NextFunction, Request, Response, Router } from "express";
import JsonWebToken from "@common/utils/jwt";
import IController from "@common/interfaces/controller";
import catchAsync from "@common/utils/catch.error";
import DTOValidation from "@common/middlewares/validation.middleware";
import RegisterUserDTO from "@common/dtos/register-user.dto"
import UserModel, { IUser } from "@common/models/user.model";
import AppError from "@common/services/errors/app.error";
import passport from "passport";

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
        this.router.post('/login', this.login)
        this.router.post('/register', DTOValidation.validate<RegisterUserDTO>(RegisterUserDTO, true), catchAsync(this.register))
        
        // authentication with Google OAuth 2.0
        this.router.get('/google', passport.authenticate('google', {
            scope: ['profile', 'email']
        }))
        // google callback URL
        this.router.get('/google/cb', passport.authenticate('google', {session: false}), this.googleCallbackHandler) 
       
        // authentication with Facebook
        this.router.get('/facebook', passport.authenticate('facebook', {
            scope: ['public_profile', 'email']
        }))
        // facebook callback URL
        this.router.get('/facebook/cb', passport.authenticate('facebook', {session: false}), this.facebookCallbackHandler) 
       
        // protected route
        this.router.get('/protect', this.protect, this.examplePrivateLogicHandler)
    }
    
    /// > LOGIN
    private login = (req: Request, res: Response, next: NextFunction) => {
    }

    /// > REGISTER
    private register = async (req: Request, res: Response, next: NextFunction) => {
        const userRegisterInfo = req.body as RegisterUserDTO
        const foundedUser = await UserModel.findOne({ username: userRegisterInfo.username });

        if (foundedUser)
            return next(new AppError('This username has already been registered', 400));

        const newUser = await UserModel.create({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            passwordConfirm: req.body.passwordConfirm
        })

        const accessToken = await JsonWebToken.createToken({_id: newUser.id}, {expiresIn: process.env.JWT_ACCESS_EXPIRES})
        
        res.cookie('jwt', accessToken, {
            expires: new Date(Date.now() + Number(process.env.JWT_ACCESS_EXPIRES)), // Cookie expiration time in milliseconds
            httpOnly: true, // Make the cookie accessible only through HTTP
            secure: req.secure || req.headers['x-forwarded-proto'] === 'https', // Ensure that the cookie is secure in a production environment
          });

        return res.status(200).json({
            message: "Register successfully",
            user: newUser,
            accessToken: accessToken
        })
    }

    private googleCallbackHandler = async (req: Request, res: Response, next: NextFunction) => {
        console.log('this req.user: ', req.user);
        const accessToken = await JsonWebToken.createToken({_id: req.user?.id}, {expiresIn: process.env.JWT_ACCESS_EXPIRES})
        res.cookie('jwt', accessToken, {
            expires: new Date(Date.now() + Number(process.env.JWT_ACCESS_EXPIRES)), // Cookie expiration time in milliseconds
            httpOnly: true, // Make the cookie accessible only through HTTP
            secure: req.secure || req.headers['x-forwarded-proto'] === 'https', // Ensure that the cookie is secure in a production environment
          });
        res.redirect('http://localhost:3000')
    }

    private facebookCallbackHandler = async (req: Request, res: Response, next: NextFunction) => { 
        console.log('this req.user', req.user);
        const accessToken = await JsonWebToken.createToken({_id: req.user?.id}, {expiresIn: process.env.JWT_ACCESS_EXPIRES})
        res.cookie('jwt', accessToken, {
            expires: new Date(Date.now() + Number(process.env.JWT_ACCESS_EXPIRES)), // Cookie expiration time in milliseconds
            httpOnly: true, // Make the cookie accessible only through HTTP
            secure: req.secure || req.headers['x-forwarded-proto'] === 'https', // Ensure that the cookie is secure in a production environment
          });
        res.redirect('http://localhost:3000')
    }
 
    /// > PROTECT
    private protect = (req: Request, res: Response, next: NextFunction) => {
        passport.authenticate('jwt', {session: false}, (err: Error, user: IUser, info: any) => {
            if (info instanceof Error) return next(info);
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