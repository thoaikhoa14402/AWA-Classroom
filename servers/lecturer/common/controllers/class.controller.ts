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
import GMailer from '../services/mailer.builder';
import path from 'path';
import handlebars from 'handlebars';
import * as fs from 'fs';
import InviteClassDTO from '../dtos/invite-class.dto';
import Jwt from '../utils/jwt';
import JoinClassDTO from '../dtos/join-class';
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
        this.router.post('/', DTOValidation.validate<CreateClassDTO>(CreateClassDTO), AuthController.protect, catchAsync(this.createClass));

        this.router.param('id', DTOValidation.extractParams(['id']));
        // this.router.get('/:id?', AuthController.protect, cacheMiddleware(this.classCacheKey, this.classCacheRes), catchAsync(this.getClass));
        this.router.get('/:id?', AuthController.protect, catchAsync(this.getClass));

        this.router.post('/invite/:id', DTOValidation.validate<InviteClassDTO>(InviteClassDTO), AuthController.protect, this.ownerProtect, catchAsync(this.sendInvitedMessage));
        this.router.post('/join/:id', DTOValidation.validate<JoinClassDTO>(JoinClassDTO), AuthController.protect, this.invitedProtect, catchAsync(this.joinClass));
    
        this.router.delete('/:id?', AuthController.protect, this.ownerProtect, catchAsync(this.deleteClass));
    }

    private deleteClass = async (req: Request, res: Response, next: NextFunction) => {
        const classInfo: IClass | null = await ClassModel.findOne({ slug: req.params.id }).lean();
        
        if (!classInfo) {
            return next(new AppError('No class found with that ID', 404));
        }

        await JoinedClassInfoModel.deleteMany({ class: classInfo._id });
        await ClassModel.deleteOne({ slug: req.body.id });

        const redisClient = redis.getClient();
        await redisClient?.del(this.classCacheKey(req));

        res.status(200).json({
            status: 'success',
            message: 'Delete class successfully',
            data: {}
        });
    };

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
                            { slug: req.body.id, active: true },
                            {
                                $or: [
                                    { 'lecturers._id': new mongoose.Types.ObjectId(req.user?.id) },
                                    { 'owner._id': new mongoose.Types.ObjectId(req.user?.id) }
                                ]
                            }
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
                    $and: [
                        {
                            active: true,
                        },
                        {
                            $or: [
                                { 'lecturers._id': new mongoose.Types.ObjectId(req.user?.id) },
                                { 'owner._id': new mongoose.Types.ObjectId(req.user?.id) }
                            ]
                        }
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

    private createClass = async (req: Request, res: Response, next: NextFunction) => {

        const { name, cid } = req.body as CreateClassDTO;

        const classCreated: IClass = await ClassModel.create({
            name,
            cid,
            owner: req.user!._id
        });

        const classInfo: IClass | null = await ClassModel.findOne({_id: classCreated.id, owner: req.user?.id}).populate('owner').lean();

        const redisClient = redis.getClient();
        await redisClient?.del(this.classCacheKey(req));

        res.json({
            status: 'success',
            message: 'Create class successfully',
            data: classInfo
        })
    };
    
    private ownerProtect = async (req: Request, res: Response, next: NextFunction) => {
        const classInfo: IClass | null = await ClassModel.findOne({ slug: req.body.id, owner: req.user?.id, active: true }).lean();
        
        if (!classInfo) {
            return next(new AppError('No class found with that ID', 404));
        }

        req.class = classInfo;

        next();
    };

    private invitedProtect = async (req: Request, res: Response, next: NextFunction) => {

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
                $project: {
                    slug: 1,
                    owner: 1,
                    lecturers: {
                        _id: 1,
                    },
                }
            },
            {
                $match: {
                    $and: [
                        { slug: req.body.classID },
                        {
                            $or: [
                                { 'lecturers._id': new mongoose.Types.ObjectId(req.user?.id) },
                                { owner: new mongoose.Types.ObjectId(req.user?.id) }
                            ]
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

    private sendInvitedMessage = async (req: Request, res: Response, next: NextFunction) => {
        const inviteInfo = req.body as InviteClassDTO;

        const source = fs.readFileSync(path.join(__dirname, '../../templates/invitationMailer/index.html'), 'utf8').toString();
        const template = handlebars.compile(source);
        
        const inviteCode = await Jwt.createToken({ 
            email: req.user?.email,
            classID: req.class.slug
        }, {
            expiresIn: 10 * 60 * 60 * 1000
        });
        
        const props = {
            sender: req.user?.username,
            classID: req.class.cid,
            className: req.class.name,
            role: inviteInfo.role,
            inviteLink: (inviteInfo.role === 'lecturer') ? inviteInfo.inviteLink.replace(/\?code=\w{7}/, `?code=${inviteCode}`) : inviteInfo.inviteLink
        };

        const htmlToSend = template(props);

        const emailList = req.body.emails;

        GMailer.sendMail({
            to: emailList,
            subject: 'Class invitation',
            html: htmlToSend
        });

        res.status(200).json({
            status: 'success',
            message: 'Send invited message successfully',
            data: {}
        });
    }

    private joinClass = async (req: Request, res: Response, next: NextFunction) => {
        const joinInfo = req.body as JoinClassDTO;
        const decoded = await Jwt.verifyToken(joinInfo.code);

        if (decoded.classID !== req.body.classID) {
            return next(new AppError('Invalid invitation code', 400));
        }

        const classInfo: any = await ClassModel.findOne({ slug: decoded.classID });

        if (!classInfo) {
            return next(new AppError('No class found with that ID', 404));
        }
        
        classInfo?.lecturers.push(req.user?.id);

        const joinedData = await classInfo.save();

        const newClass = await ClassModel.findOne({ slug: joinedData.slug }).populate('lecturers students owner').lean();

        const redisClient = redis.getClient();
        await redisClient?.del(this.classCacheKey(req));

        return res.status(200).json({
            status: 'success',
            message: 'Join class successfully',
            data: newClass
        });
    };
}

export default new ClassController();