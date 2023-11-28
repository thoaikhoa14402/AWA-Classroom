import { NextFunction, Request, Response, Router } from "express";
import IController from "../interfaces/controller";
import catchAsync from "../utils/catch.error";
import { AuthController } from ".";
import cacheMiddleware from "../middlewares/cache.middleware";
import DTOValidation from "../middlewares/validation.middleware";
import AppError from "../services/errors/app.error";
import redis from "../redis";
import GradeStructureDTO from "../dtos/grade-structure.dto";
import ClassModel from "../models/class.model";

/*
 USER CONTROLLER 
1. GET PROFILE
2. UPDATE PROFILE
3. UPLOAD AVATAR
4. RESET PASSWORD
*/

class GradeController implements IController {
    path: string = "/grade";
    router: Router = Router();

    public gradeCachekey(req: Request): string {
        return `grade?id=${req.params.id}`;
    }

    constructor() {
        this.router.param('classID', DTOValidation.extractParams(['classID']));

        this.router.put('/composition/:classID?', DTOValidation.validate<GradeStructureDTO>(GradeStructureDTO), AuthController.protect, catchAsync(this.putGradeComposition));
    }

    private putGradeComposition = async (req: Request, res: Response, next: NextFunction) => {
        const gradeCompositionInfo: GradeStructureDTO = req.body;

        const classInfo = await ClassModel.findOne({ slug: gradeCompositionInfo.classID });

        if (!classInfo) {
            return next(new AppError('Class not found!', 404));
        }

        classInfo.gradeColumns = gradeCompositionInfo.gradeCompositions;
        
        const newClassData = await classInfo.save();

        res.status(200).json({
            status: 'success',
            data: newClassData.gradeColumns
        });
    };
}

export default new GradeController();