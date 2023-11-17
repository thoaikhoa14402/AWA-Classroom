import { NextFunction, Request, Response, Router } from "express";
import IController from "../interfaces/controller";
import catchAsync from "../utils/catch.error";
import { AuthController } from ".";
import cacheMiddleware from "../middlewares/cache.middleware";
import MulterCloudinaryUploader from "../multer";
import UpdateProfileDTO from "../dtos/update-profile.dto";
import DTOValidation from "../middlewares/validation.middleware";
import UserModel from "../models/user.model";

/*
 USER CONTROLLER 
1. GET PROFILE
2. UPDATE PROFILE
3. UPLOAD AVATAR
*/

class UserController implements IController {
    path: string = "/user";
    router: Router = Router();

    public profileCacheKey(req: Request): string {
        return `profile?id=${req.user!.id}`;
    }

    constructor() {
        this.router.get('/profile', AuthController.protect, cacheMiddleware(this.profileCacheKey), catchAsync(this.getProfile));
        
        this.router.patch('/profile', DTOValidation.validate<UpdateProfileDTO>(UpdateProfileDTO), AuthController.protect, catchAsync(this.updateProfile));
        
        const multercloud = new MulterCloudinaryUploader(['jpg', 'jpeg', 'png'], 1 * 1024 * 1024);
        this.router.put('/upload', AuthController.protect, multercloud.single('avatar'), multercloud.uploadCloud('avatars'), catchAsync(this.uploadAvatar));

        this.router.get('/:id', AuthController.protect, catchAsync(this.getProfileById));
    }
    
    /// > GET PROFILE
    private getProfile = async (req: Request, res: Response, next: NextFunction) => {
        return res.status(200).json({
            status: 'success',
            data: req.user
        });
    }

    /// > UPDATE PROFILE
    private updateProfile = async (req: Request, res: Response, next: NextFunction) => {
        const newProfile = req.body as UpdateProfileDTO;

        const updatedProfile = await UserModel.findByIdAndUpdate(req.user!.id, newProfile, { new: true, runValidators: true });

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

        return res.status(200).json({
            status: 'success',
            data: req.cloudinaryResult
        });
    }

    private getProfileById = async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.params.id;
        
        const user = await UserModel.findById(userId);

        return res.status(200).json({
            message: "success",
            user: user,
        })
    }
}

export default new UserController();