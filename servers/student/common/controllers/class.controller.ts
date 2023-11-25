import { StudentIDDTO } from './../dtos/student-id.dto';
import ClassModel, { IClass } from '../models/class.model';
import JoinedClassInfoModel from '../models/joinedClassInfo.model';
import { NextFunction, Request, Response, Router } from "express";
import IController from "../interfaces/controller";
import catchAsync from "../utils/catch.error";
import { AuthController } from ".";
import DTOValidation from "../middlewares/validation.middleware";
import AppError from "../services/errors/app.error";
import cacheMiddleware from '../middlewares/cache.middleware';
import redis from '../redis';
import JoinClassDTO, { JoinWithCodeDTO } from '../dtos/join-class';
import mongoose from 'mongoose';

/*
 CLASS CONTROLLER 
1. CREATE CLASS
2. GET ALL CLASS CREATED & JOINED
*/

class ClassController implements IController {
    path: string = "/classes";
    router: Router = Router();

    public classCacheKey(req: Request): string {
        return `class?id=${req.body.id}&owner=${req.user?.id}`;
    }

    constructor() {
        this.router.param('id', DTOValidation.extractParams(['id']));
        // this.router.get('/:id?', AuthController.protect, cacheMiddleware(this.classCacheKey, this.classCacheRes), catchAsync(this.getClass));
        this.router.get('/:id?', AuthController.protect, catchAsync(this.getClass));

        this.router.post('/join/:id', DTOValidation.validate<JoinClassDTO>(JoinClassDTO), AuthController.protect, this.invitedProtect, catchAsync(this.joinClass));
        this.router.post('/join-with-code/:id?', DTOValidation.validate<JoinWithCodeDTO>(JoinWithCodeDTO), AuthController.protect, this.invitedProtect, catchAsync(this.joinWithCode));
        this.router.patch('/student-id/:id', DTOValidation.validate<StudentIDDTO>(StudentIDDTO), AuthController.protect, this.joinedProtect, catchAsync(this.updateID));
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
            const classArr = await ClassModel.aggregate([
                {
                    $lookup: {
                        from: 'users',
                        localField: 'lecturers',
                        foreignField: '_id',
                        as: 'lecturers',
                    },
                },
                {   
                    $lookup: {
                        from: 'users',
                        localField: 'students',
                        foreignField: '_id',
                        as: 'students',
                    },
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'owner',
                        foreignField: '_id',
                        as: 'owner',
                    },
                },
                { $unwind: '$owner' },
                {
                    $match: {
                        slug: req.body.id,
                        'students._id': new mongoose.Types.ObjectId(req.user?.id)
                    },
                },
                { $limit: 1 }
            ]);

            const classInfo: IClass | null = classArr.length > 0 ? classArr[0] : null;
            
            if (!classInfo) {
                return next(new AppError('No class found with that ID', 404));
            }

            const joinedClassInfo = await JoinedClassInfoModel.findOne({ user: req.user?.id, class: classInfo._id }).lean();

            const redisClient = redis.getClient();
            await redisClient?.setEx(this.classCacheKey(req), Number(process.env.REDIS_CACHE_EXPIRES), JSON.stringify(classInfo));
            
            return res.status(200).json({
                status: 'success',
                message: 'Get class successfully',
                data: {
                    ...classInfo,
                    studentID: joinedClassInfo?.studentID ?? ''
                }
            });
        }
        
        const classArr = await ClassModel.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'lecturers',
                    foreignField: '_id',
                    as: 'lecturers',
                },
            },
            {   
                $lookup: {
                    from: 'users',
                    localField: 'students',
                    foreignField: '_id',
                    as: 'students',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'owner',
                    foreignField: '_id',
                    as: 'owner',
                },
            },
            { $unwind: '$owner' },
            {
                $match: {
                    'students._id': new mongoose.Types.ObjectId(req.user?.id)
                },
            },
        ]);

        const classesInfo: IClass[] = classArr;

        const redisClient = redis.getClient();
        await redisClient?.setEx(this.classCacheKey(req), Number(process.env.REDIS_CACHE_EXPIRES), JSON.stringify(classesInfo));

        res.status(200).json({
            status: 'success',
            message: 'Get classes successfully',
            data: classesInfo ?? []
        });
    };
    
    private invitedProtect = async (req: Request, res: Response, next: NextFunction) => {

        const classArr = await ClassModel.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'students',
                    foreignField: '_id',
                    as: 'students',
                },
            },
            { 
                $project: {
                    slug: 1,
                    inviteCode: 1,
                    students: {
                        _id: 1,
                    },
                }
            },
            {
                $match: {
                    $and: [
                        {
                            $or: [
                                { slug: req.body.id },
                                { inviteCode: req.body.code }
                            ]
                        },
                        {
                            'students._id': new mongoose.Types.ObjectId(req.user?.id)
                        }
                    ]
                },
            },
            {
                $limit: 1
            }
        ]);
          
        const classInfo: IClass | null = classArr.length > 0 ? classArr[0] : null;
        
        if (!classInfo) {
            return next();
        }
            
        return next(new AppError('You has joined this class', 404));
    };

    private joinClass = async (req: Request, res: Response, next: NextFunction) => {
        const classInfo: any = await ClassModel.findOne({ slug: req.body.classID, inviteCode: req.body.code });

        if (!classInfo) {
            return next(new AppError('No class found with that ID', 404));
        }

        classInfo?.students.push(req.user?.id);

        await JoinedClassInfoModel.create({
            user: req.user?.id,
            class: classInfo._id,
        });

        const joinedData = await classInfo.save();  

        const newClass = await ClassModel.findOne({ slug: joinedData.slug }).populate('lecturers students owner').lean();

        const redisClient = redis.getClient();
        await redisClient?.del(this.classCacheKey(req));

        return res.status(200).json({
            status: 'success',
            message: 'Join class successfully',
            data: {
                ...newClass,
                studentID: ''
            },
        });
    };

    private joinWithCode = async (req: Request, res: Response, next: NextFunction) => {
        const classInfo: any = await ClassModel.findOne({ inviteCode: req.body.code });

        if (!classInfo) {
            return next(new AppError('No class found with that Code', 404));
        }

        await JoinedClassInfoModel.create({
            user: req.user?.id,
            class: classInfo._id,
        });

        classInfo?.students.push(req.user?.id);

        const joinedData = await classInfo.save();  

        const newClass = await ClassModel.findOne({ slug: joinedData.slug }).populate('lecturers students owner').lean();

        const redisClient = redis.getClient();
        await redisClient?.del(this.classCacheKey(req));

        return res.status(200).json({
            status: 'success',
            message: 'Join class successfully',
            data: {
                ...newClass,
                studentID: ''
            },
        });
    }

    private joinedProtect = async (req: Request, res: Response, next: NextFunction) => {

        const classArr = await ClassModel.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'students',
                    foreignField: '_id',
                    as: 'students',
                },
            },
            { 
                $project: {
                    slug: 1,
                    inviteCode: 1,
                    students: {
                        _id: 1,
                    },
                }
            },
            {
                $match: {
                    $and: [
                        {
                            $or: [
                                { slug: req.body.id },
                                { inviteCode: req.body.code }
                            ]
                        },
                        {
                            'students._id': new mongoose.Types.ObjectId(req.user?.id)
                        }
                    ]
                },
            },
            {
                $limit: 1
            }
        ]);

        const classInfo: IClass | null = classArr.length > 0 ? classArr[0] : null;
        
        if (!classInfo) {
            return next(new AppError('Cannot find class with that ID', 404));
        }

        next();   
    };

    private updateID = async (req: Request, res: Response, next: NextFunction) => {
        const joinedClassInfoArr = await JoinedClassInfoModel.aggregate([
            {
                $lookup: {
                    from: 'classes',
                    localField: 'class',
                    foreignField: '_id',
                    as: 'class',
                },
            },
            {
                $match: {
                    'class.slug': req.body.id,
                    user: new mongoose.Types.ObjectId(req.user?.id)
                },
            },
            {
                $limit: 1
            }
        ]);

        const joinedClassInfo = joinedClassInfoArr.length > 0 ? joinedClassInfoArr[0] : null;

        if (!joinedClassInfo) {
            return next(new AppError('Cannot find class with that ID123', 404));
        }

        const isUsed = await JoinedClassInfoModel.findOne({ class: joinedClassInfo.class, studentID: req.body.studentID });

        if (isUsed) {
            return next(new AppError('Student ID is used', 404));
        }

        const updatedClassInfo = await JoinedClassInfoModel.findOneAndUpdate({ class: joinedClassInfo.class, user: req.user?.id }, { studentID: req.body.studentID }, { new: true });

        const redisClient = redis.getClient();
        await redisClient?.del(this.classCacheKey(req));

        return res.status(200).json({
            status: 'success',
            message: 'Update student ID successfully',
            data: {
                studentID: updatedClassInfo?.studentID ?? ''
            }
        });
    }
}

export default new ClassController();