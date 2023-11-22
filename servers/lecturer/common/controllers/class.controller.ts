import ClassModel, { IClass } from './../models/class.model';
import { CreateClassDTO } from './../dtos/create-class.dto';
import { NextFunction, Request, Response, Router } from "express";
import IController from "../interfaces/controller";
import catchAsync from "../utils/catch.error";
import { AuthController } from ".";
import DTOValidation from "../middlewares/validation.middleware";
import AppError from "../services/errors/app.error";
import cacheMiddleware from '../middlewares/cache.middleware';
import redis from '../redis';

/*
 CLASS CONTROLLER 
1. CREATE CLASS
*/

class ClassController implements IController {
    path: string = "/classes";
    router: Router = Router();

    public classCacheKey(req: Request): string {
        return `class?id=${req.body.id}&owner=${req.user?.id}`;
    }

    constructor() {
        this.router.post('/', DTOValidation.validate<CreateClassDTO>(CreateClassDTO), AuthController.protect, catchAsync(this.createClass));

        this.router.param('id', DTOValidation.extractParams(['id']));
        this.router.get('/:id?', AuthController.protect, cacheMiddleware(this.classCacheKey, this.classCacheRes), catchAsync(this.getClass));
    }

    private classCacheRes = async (req: Request, res: Response, next: NextFunction, data: any) => {
        if (req.body.id)
            return res.status(200).json({
                status: 'success',
                message: 'Get class successfully',
                data: data
            });

        res.status(200).json({
            status: 'success',
            message: 'Get classes successfully',
            data: data || []
        });  
    };

    private getClass = async (req: Request, res: Response, next: NextFunction) => { 
        if (req.body?.id) {
            
            const classInfo: IClass | null = await ClassModel.findOne({ slug: req.params.id, owner: req.user?.id }).populate('owner students lecturers').lean();
            
            if (!classInfo) {
                return next(new AppError('No class found with that ID', 404));
            }

            const redisClient = redis.getClient();
            await redisClient?.setEx(this.classCacheKey(req), Number(process.env.REDIS_CACHE_EXPIRES), JSON.stringify(classInfo));
            
            return res.status(200).json({
                status: 'success',
                message: 'Get class successfully',
                data: classInfo
            });
        }
        
        const classesInfo: IClass | null = await ClassModel.find({owner: req.user?.id}).populate('owner students lecturers').lean();

        const redisClient = redis.getClient();
        await redisClient?.setEx(this.classCacheKey(req), Number(process.env.REDIS_CACHE_EXPIRES), JSON.stringify(classesInfo));

        res.status(200).json({
            status: 'success',
            message: 'Get classes successfully',
            data: classesInfo ?? []
        });
    };

    private createClass = async (req: Request, res: Response, next: NextFunction) => {

        const { name, cid } = req.body as CreateClassDTO;

        const classCreated: IClass = await ClassModel.create({
            name,
            cid,
            owner: req.user!._id
        });

        const classInfo: IClass | null = await ClassModel.findOne({_id: classCreated.id, owner: req.user?.id}).populate('owner').lean();

        res.json({
            status: 'success',
            message: 'Create class successfully',
            data: classInfo
        })
    };
}

export default new ClassController();