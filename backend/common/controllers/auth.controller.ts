import { NextFunction, Request, Response, Router } from "express";
import JsonWebToken from "@common/utils/jwt";
import IController from "@common/interfaces/controller";
import catchAsync from "@common/utils/catch.error";
import DTOValidation from "@common/middlewares/validation.middleware";
import RegisterUserDTO from "@common/dtos/register-user.dto"
import UserModel from "@common/models/user.model";
import AppError from "@common/services/errors/app.error";

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
    }

    /// > LOGIN
    private login = (req: Request, res: Response, next: NextFunction) => {
    }

    /// > REGISTER
    private register = async (req: Request, res: Response, next: NextFunction) => {
        const userRegisterInfo = req.body as RegisterUserDTO
        console.log('User Register Info: ', userRegisterInfo);

        const foundedUser = await UserModel.findOne({ username: userRegisterInfo.username });

        if (foundedUser)
            return next(new AppError('This username has already been registered', 400));

        const newUser = await UserModel.create({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            passwordConfirm: req.body.passwordConfirm
        })

            const accessToken = await JsonWebToken.createToken({_id: newUser._id.toString()}, {expiresIn: process.env.JWT_ACCESS_EXPIRES as string,})
        
        res.cookie('jwt', accessToken, {
            expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Cookie expiration time in milliseconds
            httpOnly: true, // Make the cookie accessible only through HTTP
            secure: req.secure || req.headers['x-forwarded-proto'] === 'https', // Ensure that the cookie is secure in a production environment
          });

        return res.status(200).json({
            message: "Register successfully",
            user: newUser,
            accessToken: accessToken
        })
    }
}

export default new AuthController();