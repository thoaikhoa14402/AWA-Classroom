import { NextFunction, Request, Response, Router } from "express";
import IController from "../interfaces/controller";
import catchAsync from "../utils/catch.error";
import { AuthController } from ".";
import cacheMiddleware from "../middlewares/cache.middleware";
import MulterCloudinaryUploader from "../multer";
import UpdateProfileDTO from "../dtos/update-profile.dto";
import DTOValidation from "../middlewares/validation.middleware";
import UserModel from "../models/user.model";
import ResetPasswordDTO from "../dtos/reset-password.dto";
import AppError from "../services/errors/app.error";
import redis from "../redis";
import cloudinary from "../cloudinary";

/*
 USER CONTROLLER 
1. GET PROFILE
2. UPDATE PROFILE
3. UPLOAD AVATAR
4. RESET PASSWORD
*/

class UserController implements IController {
    path: string = "/user";
    router: Router = Router();

    public profileCacheKey(req: Request): string {
        return `profile?id=${req.user!.id}`;
    }

    public profileAccountCacheKey(req: Request): string {
        return `profileById?id=${req.params.id}`;
    }

    constructor() {
        this.router.get('/profile', AuthController.protect, cacheMiddleware(this.profileCacheKey, this.profileCacheRes), catchAsync(this.getProfile));
        
        this.router.patch('/profile', DTOValidation.validate<UpdateProfileDTO>(UpdateProfileDTO), AuthController.protect, catchAsync(this.updateProfile));
        
        const multercloud = new MulterCloudinaryUploader(['jpg', 'jpeg', 'png'], 1 * 1024 * 1024);
        this.router.put('/upload', AuthController.protect, multercloud.single('avatar'), multercloud.uploadCloud('avatars'), catchAsync(this.uploadAvatar));

        this.router.get('/:id', AuthController.protect, cacheMiddleware(this.profileAccountCacheKey, this.profileCacheByIdRes), catchAsync(this.getProfileById));

        this.router.patch('/reset-password', AuthController.protect, DTOValidation.validate<ResetPasswordDTO>(ResetPasswordDTO), catchAsync(this.resetPassword));
    }
    
    /// > HANDLE RES CACHE
    private profileCacheRes = async (req: Request, res: Response, next: NextFunction, data: any) => { 
        return res.status(200).json({
            status: 'success',
            data: data
        });  
    };

    private profileCacheByIdRes = async (req: Request, res: Response, next: NextFunction, data: any) => { 
        return res.status(200).json({
            status: 'success',
            user: data
        }); 
    }


    /// > GET PROFILE
    private getProfile = async (req: Request, res: Response, next: NextFunction) => {

        const redisClient = redis.getClient();
        await redisClient?.setEx(this.profileCacheKey(req), Number(process.env.REDIS_CACHE_EXPIRES), JSON.stringify(req.user));

        return res.status(200).json({
            status: 'success',
            data: req.user
        });
    }

    /// > UPDATE PROFILE
    private updateProfile = async (req: Request, res: Response, next: NextFunction) => {
        const newProfile = req.body as UpdateProfileDTO;

        const updatedProfile = await UserModel.findByIdAndUpdate(req.user!.id, newProfile, { new: true, runValidators: true });

        const redisClient = redis.getClient();
        await redisClient?.del(this.profileCacheKey(req));

        res.status(200).json({
            message: "update profile successfully",
            data: updatedProfile
        });
    }

    /// > UPLOAD AVATAR
    private uploadAvatar = async (req: Request, res: Response, next: NextFunction) => {

        await UserModel.findByIdAndUpdate(req.user!.id, {
            avatar: req.cloudinaryResult.secure_url || req.cloudinaryResult.url
        });

        const avatar = req.user!.avatar;

        if (avatar?.includes('cloudinary')) {
            const matches = RegExp(/avatars\/[a-zA-Z0-9]+/).exec(avatar);
            await cloudinary.delete([matches![0]]);
        }

        const redisClient = redis.getClient();
        await redisClient?.del(this.profileCacheKey(req));

        return res.status(200).json({
            status: 'success',
            data: req.cloudinaryResult
        });
    }

    private getProfileById = async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.params.id;
        
        const user = await UserModel.findById(userId);

        const redisClient = redis.getClient();
        await redisClient?.setEx(this.profileAccountCacheKey(req), Number(process.env.REDIS_CACHE_EXPIRES), JSON.stringify(user));

        return res.status(200).json({
            message: "success",
            user: user,
        })
    }

    private resetPassword = async (req: Request, res: Response, next: NextFunction) => {
        const resetPassword = req.body as ResetPasswordDTO;

        const user = await UserModel.findById(req.user!.id).select("+password");

        const validPassword = await user?.correctPassword(resetPassword.currentPassword, user.password!);

        if (user && validPassword) { 
            user.password = resetPassword.newPassword;
            user.passwordChangedAt = Date.now() - 1000;

            await user.save();

            return res.status(200).json({
                message: "success",
                data: null,
            });
        }

        next(new AppError("Password is not correct", 403));
    }
}

export default new UserController();