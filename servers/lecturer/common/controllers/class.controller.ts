import { NextFunction, Request, Response, Router } from "express";
import IController from "../interfaces/controller";
import catchAsync from "../utils/catch.error";
import { AuthController } from ".";
import cacheMiddleware from "../middlewares/cache.middleware";
import DTOValidation from "../middlewares/validation.middleware";
import UserModel from "../models/user.model";
import AppError from "../services/errors/app.error";

/*
 CLASS CONTROLLER 
1. CREATE CLASS
*/

class ClassController implements IController {
    path: string = "/class";
    router: Router = Router();

    constructor() {
        this.router.post('/', AuthController.protect, this.createClass);
    }

    private createClass = async (req: Request, res: Response, next: NextFunction) => {
        res.json({
            status: 'success',
            message: 'Create class successfully',
        })
    }
}

export default new ClassController();