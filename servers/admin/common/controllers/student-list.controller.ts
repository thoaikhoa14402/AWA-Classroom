import { NextFunction, Request, Response, Router } from "express";
import IController from "../interfaces/controller";
import catchAsync from "../utils/catch.error";
import { AuthController } from ".";
import AppError from "../services/errors/app.error";
import ClassModel from "../models/class.model";
import MulterCloudinaryUploader from "../multer";
import XLSX from "xlsx";
import axios from "axios";
import cloudinary from "../cloudinary";
import DTOValidation from "../middlewares/validation.middleware";
import StudentListDTO from "../dtos/student-list.dto";

/*
 USER CONTROLLER 
1. GET STUDENT LIST
*/

class StudentListController implements IController {
    path: string = "/student-list";
    router: Router = Router();

    public studentListCachekey(req: Request): string {
        return `student-list?id=${req.params.id}`;
    }

    constructor() {
        const multercloud = new MulterCloudinaryUploader(['xlsx', 'csv'], 15 * 1024 * 1024);
        this.router.put('/:classID/upload', AuthController.protect, multercloud.single('studentlist'), multercloud.uploadCloud('studentlist'), catchAsync(this.putStudentListWithFile));
        
        this.router.param('classID', DTOValidation.extractParams(['classID']));
        this.router.put('/:classID?', DTOValidation.validate(StudentListDTO), AuthController.protect, catchAsync(this.putStudentList));
    }

    private getClassDataWithStudentListQuery = async (classID: string) => {
        return await ClassModel.aggregate([
            {
                $lookup: {
                    from: 'joinedclassinfos',
                    let: { studentListIds: '$studentList.student_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $in: ['$studentID', '$$studentListIds']
                                }
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
                $match: {
                    slug: classID
                }
            },
            {
                $limit: 1
            }
        ]);
    }

    private putStudentList = async (req: Request, res: Response, next: NextFunction) => {
        if (!req.params.classID) {
            return next(new AppError('Class not found!', 404));
        }
        
        const classInfo = await ClassModel.findOne({ slug: req.params.classID });

        if (!classInfo) {
            return next(new AppError('Class not found!', 404));
        }

        const studentListInfo = req.body as StudentListDTO;

        classInfo.studentList = studentListInfo.studentList;

        const gradeList: any[] = classInfo.studentList.map((student: any) => {
            if (student.student_id) {

                const grade = {
                    student_id: student.student_id,
                    grade_name: classInfo.gradeColumns.map((gradeCol) => gradeCol.name),
                    grade: classInfo.gradeColumns.map((gradeCol) => {
                        const gradeOfStudent = classInfo.gradeList.find((el) => el.student_id === student.student_id);

                        return {
                            col: gradeCol.name,
                            value: gradeOfStudent ? gradeOfStudent.grade.find(el2 => el2.col === gradeCol.name)?.value ?? '' : ''
                        }
                    })
                }
                return grade;
            }
        });

        classInfo.gradeList = gradeList;

        await classInfo.save();

        const fullclassData = await this.getClassDataWithStudentListQuery(studentListInfo.classID);
        
        res.status(200).json({
            status: 'success',
            message: 'Update student list successfully',
            data: fullclassData.length ? fullclassData[0].studentList : []
        });
    }

    private putStudentListWithFile = async (req: Request, res: Response, next: NextFunction) => {
        if (!req.params.classID) {
            return next(new AppError('Class not found!', 404));
        }
        
        const classInfo = await ClassModel.findOne({ slug: req.params.classID });

        if (!classInfo) {
            return next(new AppError('Class not found!', 404));
        }

        const studentlistURL = classInfo.studentListUrl;

        if (studentlistURL?.includes('cloudinary')) {
            const matches = RegExp(/studentlist\/[a-zA-Z0-9]+/).exec(studentlistURL);
            await cloudinary.delete([matches![0]]);
        }

        classInfo.studentListUrl = req.cloudinaryResult.secure_url || req.cloudinaryResult.url;

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

        const studentList = filteredData.map((row: any) => {
            const student: any = {};

            header.forEach((column: string, index: any) => {
                const key: any = column.toLowerCase().replace(/ /g, '_');

                if (key !== 'student_id' && key !== 'full_name' && key !== 'email') return;
                student[key] = row[index];
            });

            if (student)
                return student;
        });

        classInfo.studentList = studentList;

        const gradeList: any[] = classInfo.studentList.map((student: any) => {
            if (student.student_id) {

                const grade = {
                    student_id: student.student_id,
                    grade_name: classInfo.gradeColumns.map((gradeCol) => gradeCol.name),
                    grade: classInfo.gradeColumns.map((gradeCol) => {
                        return {
                            col: gradeCol.name,
                            value: ''
                        }
                    })
                }
                return grade;
            }
        });

        classInfo.gradeList = gradeList;

        await classInfo.save();

        const fullclassData = await this.getClassDataWithStudentListQuery(req.params.classID);

        res.status(200).json({
            status: 'success',
            message: 'upload student list successfully',
            data: fullclassData.length ? fullclassData[0].studentList : []
        });
    };
}

export default new StudentListController();