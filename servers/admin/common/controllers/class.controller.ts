import ClassModel, { IClass } from './../models/class.model';
import { NextFunction, Request, Response, Router } from "express";
import IController from "../interfaces/controller";
import catchAsync from "../utils/catch.error";
import { AuthController } from ".";
import DTOValidation from "../middlewares/validation.middleware";
import AppError from "../services/errors/app.error";
import cacheMiddleware from '../middlewares/cache.middleware';
import redis from '../redis';
import mongoose from 'mongoose';
import JoinedClassInfoModel from '../models/joinedClassInfo.model';

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
            const classInfoId = await ClassModel.findOne({ slug: req.body.id }).lean();

            if (!classInfoId) {
                return next(new AppError('No class found with that ID', 404));
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
                        $and: [
                            { slug: req.body.id },
                        ]
                    },
                },
                {
                    $lookup: {
                        from: 'joinedclassinfos',
                        let: { studentListIds: '$studentList.student_id' },
                        pipeline: [
                            {
                                $match: {
                                    $and: [
                                        {
                                            $expr: {
                                                $in: ['$studentID', '$$studentListIds']
                                            }
                                        },
                                        {
                                            class: new mongoose.Types.ObjectId(classInfoId._id)
                                        }
                                    ]
                                }
                            },
                            {
                                $project: {
                                    _id: 0,
                                    user: 1,
                                    class: 1,
                                    joinAt: 1,
                                    studentID: 1
                                }
                            }
                        ],
                        as: 'student_info'
                    }
                },
                {
                    $addFields: {
                        "studentList": {
                            $map: {
                                input: "$studentList",
                                as: "student",
                                in: {
                                    $mergeObjects: [
                                        "$$student",
                                        {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: "$student_info",
                                                        as: "matched",
                                                        cond: {
                                                            $eq: ["$$matched.studentID", "$$student.student_id"]
                                                        }
                                                    }
                                                }, 0
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    $lookup: {
                        from: 'joinedclassinfos',
                        let: { gradeListIds: '$gradeList.student_id' },
                        pipeline: [
                            {
                                $match: {
                                    $and: [
                                        {
                                            $expr: {
                                                $in: ['$studentID', '$$gradeListIds']
                                            }
                                        },
                                        {
                                            class: new mongoose.Types.ObjectId(classInfoId._id)
                                        }
                                    ]
                                }
                            },
                            {
                                $project: {
                                    _id: 0,
                                    user: 1,
                                    class: 1,
                                    joinAt: 1,
                                    studentID: 1
                                }
                            }
                        ],
                        as: 'student_grade_info'
                    }
                },
                {
                    $addFields: {
                        "gradeList": {
                            $map: {
                                input: "$gradeList",
                                as: "grades",
                                in: {
                                    $mergeObjects: [
                                        "$$grades",
                                        {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: "$student_grade_info",
                                                        as: "matched",
                                                        cond: {
                                                            $eq: ["$$matched.studentID", "$$grades.student_id"]
                                                        }
                                                    }
                                                }, 0
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    }
                },
                { $limit: 1 }
            ]);

            const classInfo: IClass | null = classArr.length > 0 ? classArr[0] : null;
            
            if (!classInfo) {
                return next(new AppError('No class found with that ID', 404));
            }

            const students = await JoinedClassInfoModel.find({ class: classInfo._id, user: {
                $in: classInfo.students.map((student) => student._id)
            } }).populate('user').lean();

            const redisClient = redis.getClient();
            await redisClient?.setEx(this.classCacheKey(req), Number(process.env.REDIS_CACHE_EXPIRES), JSON.stringify(classInfo));
            
            return res.status(200).json({
                status: 'success',
                message: 'Get class successfully',
                data: {
                    ...classInfo,
                    students: [...students.map((student) => ({
                        ...student.user,
                        studentID: student.studentID
                    }))]
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
                    $or: [
                        { 'lecturers._id': new mongoose.Types.ObjectId(req.user?.id) },
                        { 'owner._id': new mongoose.Types.ObjectId(req.user?.id) }
                    ]
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
}

export default new ClassController();