import { GradeListDTO } from './../dtos/grade-list.dto';
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
import NotificationModel from "../models/notification.model";
import XLSX from 'xlsx';
import { PassThrough } from 'stream';
import MulterCloudinaryUploader from "../multer";
import cloudinary from "../cloudinary";
import axios from "axios";
import socketIO from '../socket';
import getFormatDateTime from '../utils/date.format';
import mongoose from 'mongoose';

/*
 USER CONTROLLER 
1. GET COMPOSITION
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

        this.router.post('/template/export', AuthController.protect, catchAsync(this.requestDownloadTemplate));

        const multercloud = new MulterCloudinaryUploader(['xlsx', 'csv'], 15 * 1024 * 1024);
        this.router.put('/grade-list/:classID/upload', AuthController.protect, multercloud.single('gradelist'), multercloud.uploadCloud('gradelist'), catchAsync(this.putGradeListWithFile));

        this.router.put('/list/:classID?', DTOValidation.validate<GradeListDTO>(GradeListDTO), AuthController.protect, catchAsync(this.putGradeList));

        this.router.post('/list/:classID/download', AuthController.protect, catchAsync(this.requestDownloadGradeList));
    }

    private getClassDataWithGradeListQuery = async (classID: string) => {
        const classInfoId = await ClassModel.findOne({ slug: classID }).select('_id').lean();

        if (!classInfoId) {
            return [];
        }

        return await ClassModel.aggregate([
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
            {
                $match: {
                    slug: classID
                }
            },
            {
                $limit: 1
            }
        ]);
    }

    private putGradeComposition = async (req: Request, res: Response, next: NextFunction) => {
        const gradeCompositionInfo: GradeStructureDTO = req.body;

        const classInfo = await ClassModel.findOne({ slug: gradeCompositionInfo.classID });

        if (!classInfo) {
            return next(new AppError('Class not found!', 404));
        }

        const updatedComposition = classInfo.gradeColumns.filter(el => !el.published && gradeCompositionInfo.gradeCompositions.find(el2 => el2.published && el2.name === el.name));

        classInfo.gradeColumns = gradeCompositionInfo.gradeCompositions;
        
        const newClassData = await classInfo.save();

        if (updatedComposition.length > 0) {
            const publishedCompositions = updatedComposition.map(el => el.name).join(', ');
            const createAt = getFormatDateTime();

            const newNotification = new NotificationModel({
                user: req.user?._id,
                class: newClassData._id,
                message: `has published "${publishedCompositions}" composition.`,
                navigation: `/classes/grades/${newClassData?.slug}`,
                formatedDate: createAt,
                receiver: [...newClassData.students, ...newClassData.lecturers]
            });

            const createdData = await newNotification.save();

            const notification = await NotificationModel.findById(createdData._id).populate('user class').lean();

            const io = socketIO.getIO();
            
            io.sockets.in(gradeCompositionInfo.classID).emit('notification', {
                username: req.user?.username,
                avatar: req.user?.avatar,
                createAt: notification?.createdAt,
                message: notification?.message,
                navigation: notification?.navigation,
                formatedDate: notification?.formatedDate,
                notification: {
                    ...notification
                }
            });
        }
        
        res.status(200).json({
            status: 'success',
            data: newClassData.gradeColumns
        });
    };

    private requestDownloadTemplate = async (req: Request, res: Response, next: NextFunction) => {
        const classID = req.body.classID;
        
        if (!classID) {
            return next(new AppError('Class not found!', 404));
        }

        const classInfo = await ClassModel.findOne({ slug: classID });

        if (!classInfo) {
            return next(new AppError('Class not found!', 404));
        }
        
        const gradeCol = classInfo.gradeColumns.map((col) => col.name);
        const gradeTemplate = ['Student ID', ...gradeCol];

        const wb = XLSX.utils.book_new();
        const studentIDs = classInfo.studentList.map((student) => student.student_id);

        const ws = XLSX.utils.aoa_to_sheet([gradeTemplate, ...studentIDs.map((studentID) => [studentID])]);

        XLSX.utils.book_append_sheet(wb, ws, 'Grade Template');
        
        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

        const bufferStream = new PassThrough();
        bufferStream.end(Buffer.from(buffer));

        bufferStream.pipe(res);
    }

    private putGradeListWithFile = async (req: Request, res: Response, next: NextFunction) => {
        const classID = req.params.classID;
        
        if (!classID) {
            return next(new AppError('Class not found!', 404));
        }

        const classInfo = await ClassModel.findOne({ slug: classID });

        if (!classInfo) {
            return next(new AppError('Class not found!', 404));
        }

        const gradelistURL = classInfo.gradeListUrl;

        if (gradelistURL?.includes('cloudinary')) {
            const matches = RegExp(/gradelist\/[a-zA-Z0-9]+/).exec(gradelistURL);
            await cloudinary.delete([matches![0]]);
        }

        classInfo.gradeListUrl = req.cloudinaryResult.secure_url || req.cloudinaryResult.url;

        const response = await axios.get(req.cloudinaryResult.secure_url || req.cloudinaryResult.url, { responseType: 'arraybuffer' });

        const data = new Uint8Array(response.data);

        const binaryString = data.reduce((acc, byte) => {
            return acc + String.fromCharCode(byte);
        }, '');

        const workbook = XLSX.read(binaryString, { type: 'binary' });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const header = jsonData[0] as string[];

        const filteredData = jsonData.slice(1).filter((el: any) => el.length > 0);
        
        const availableHeader = header.map((colName) => {
            if (colName === 'Student ID') return 'student_id';

            if (classInfo.gradeColumns.find((gradeCol) => gradeCol.name === colName)) {
                return colName;
            }
        });

        const gradeList = filteredData.map((row: any) => {
            const student: any = {};

            availableHeader.forEach((column: any, index: any) => {
                if (column === 'student_id') {
                    student[column] = row[index];
                }
                else {
                    student.grade_name = availableHeader.filter((col) => col !== 'student_id');
                    student.grade = [...(student.grade || []), {
                        col: column,
                        value: row[index]
                    }];
                }
            });
            
            return student;
        });

        classInfo.gradeList = gradeList;

        await classInfo.save();

        const fullclassData = await this.getClassDataWithGradeListQuery(req.params.classID);

        res.status(200).json({
            status: 'success',
            message: 'Upload grade list successfully',
            data: fullclassData.length ? fullclassData[0].gradeList : [],
        });
    }

    private putGradeList = async (req: Request, res: Response, next: NextFunction) => {
        const gradeListInfo = req.body as GradeListDTO;

        if (!gradeListInfo.classID) {
            return next(new AppError('Class not found!', 404));
        }

        const classInfo = await ClassModel.findOne({ slug: gradeListInfo.classID });

        if (!classInfo) {
            return next(new AppError('Class not found!', 404));
        }

        classInfo.gradeList = gradeListInfo.gradeList;

        await classInfo.save();

        const fullclassData = await this.getClassDataWithGradeListQuery(gradeListInfo.classID);

        res.status(200).json({
            status: 'success',
            message: 'Upload grade list successfully',
            data: fullclassData.length ? fullclassData[0].gradeList : [],
        });
    }

    private requestDownloadGradeList = async (req: Request, res: Response, next: NextFunction) => {
        const classID = req.body.classID;

        if (!classID) {
            return next(new AppError('Class not found!', 404));
        }

        const classInfo = await ClassModel.findOne({ slug: classID });

        if (!classInfo) {
            return next(new AppError('Class not found!', 404));
        }

        const gradeCol = classInfo.gradeColumns.map((col) => col.name);
        const gradeList = classInfo.gradeList.map((student) => {
            const studentID = student.student_id;
            const grade = student.grade.map((grade) => grade.value);

            let gradeTotal = classInfo.gradeColumns.reduce((acc, gradeCol, index) => {
                return acc + (grade[index] ?? 0) * (gradeCol.scale ?? 0) / 100;
            }, 0);

            if (isNaN(gradeTotal)) {
                gradeTotal = 0;
            }
            
            return [studentID, ...grade, gradeTotal];
        });

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([['Student ID', ...gradeCol, 'Total'], ...gradeList]);
        XLSX.utils.book_append_sheet(wb, ws, 'Grade List');

        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

        const bufferStream = new PassThrough();
        bufferStream.end(Buffer.from(buffer));

        bufferStream.pipe(res);
    }
}

export default new GradeController();