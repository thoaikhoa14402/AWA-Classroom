"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const catch_error_1 = __importDefault(require("../utils/catch.error"));
const _1 = require(".");
const app_error_1 = __importDefault(require("../services/errors/app.error"));
const class_model_1 = __importDefault(require("../models/class.model"));
const multer_1 = __importDefault(require("../multer"));
const xlsx_1 = __importDefault(require("xlsx"));
const axios_1 = __importDefault(require("axios"));
const cloudinary_1 = __importDefault(require("../cloudinary"));
const validation_middleware_1 = __importDefault(require("../middlewares/validation.middleware"));
const student_list_dto_1 = __importDefault(require("../dtos/student-list.dto"));
/*
 USER CONTROLLER
1. GET STUDENT LIST
*/
class StudentListController {
    studentListCachekey(req) {
        return `student-list?id=${req.params.id}`;
    }
    constructor() {
        this.path = "/student-list";
        this.router = (0, express_1.Router)();
        this.getClassDataWithStudentListQuery = (classID) => __awaiter(this, void 0, void 0, function* () {
            return yield class_model_1.default.aggregate([
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
        });
        this.putStudentList = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            if (!req.params.classID) {
                return next(new app_error_1.default('Class not found!', 404));
            }
            const classInfo = yield class_model_1.default.findOne({ slug: req.params.classID });
            if (!classInfo) {
                return next(new app_error_1.default('Class not found!', 404));
            }
            const studentListInfo = req.body;
            classInfo.studentList = studentListInfo.studentList;
            const gradeList = classInfo.studentList.map((student) => {
                if (student.student_id) {
                    const grade = {
                        student_id: student.student_id,
                        grade_name: classInfo.gradeColumns.map((gradeCol) => gradeCol.name),
                        grade: classInfo.gradeColumns.map((gradeCol) => {
                            var _a, _b;
                            const gradeOfStudent = classInfo.gradeList.find((el) => el.student_id === student.student_id);
                            return {
                                col: gradeCol.name,
                                value: gradeOfStudent ? (_b = (_a = gradeOfStudent.grade.find(el2 => el2.col === gradeCol.name)) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : '' : ''
                            };
                        })
                    };
                    return grade;
                }
            });
            classInfo.gradeList = gradeList;
            yield classInfo.save();
            const fullclassData = yield this.getClassDataWithStudentListQuery(studentListInfo.classID);
            res.status(200).json({
                status: 'success',
                message: 'Update student list successfully',
                data: fullclassData.length ? fullclassData[0].studentList : []
            });
        });
        this.putStudentListWithFile = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            if (!req.params.classID) {
                return next(new app_error_1.default('Class not found!', 404));
            }
            const classInfo = yield class_model_1.default.findOne({ slug: req.params.classID });
            if (!classInfo) {
                return next(new app_error_1.default('Class not found!', 404));
            }
            const studentlistURL = classInfo.studentListUrl;
            if (studentlistURL === null || studentlistURL === void 0 ? void 0 : studentlistURL.includes('cloudinary')) {
                const matches = RegExp(/studentlist\/[a-zA-Z0-9]+/).exec(studentlistURL);
                yield cloudinary_1.default.delete([matches[0]]);
            }
            classInfo.studentListUrl = req.cloudinaryResult.secure_url || req.cloudinaryResult.url;
            const response = yield axios_1.default.get(req.cloudinaryResult.secure_url || req.cloudinaryResult.url, { responseType: 'arraybuffer' });
            const data = new Uint8Array(response.data);
            const binaryString = data.reduce((acc, byte) => {
                return acc + String.fromCharCode(byte);
            }, '');
            const workbook = xlsx_1.default.read(binaryString, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = xlsx_1.default.utils.sheet_to_json(worksheet, { header: 1 });
            const header = jsonData[0];
            const filteredData = jsonData.slice(1).filter((el) => el.length > 0);
            const studentList = filteredData.map((row) => {
                const student = {};
                header.forEach((column, index) => {
                    const key = column.toLowerCase().replace(/ /g, '_');
                    if (key !== 'student_id' && key !== 'full_name' && key !== 'email')
                        return;
                    student[key] = row[index];
                });
                if (student)
                    return student;
            });
            classInfo.studentList = studentList;
            const gradeList = classInfo.studentList.map((student) => {
                if (student.student_id) {
                    const grade = {
                        student_id: student.student_id,
                        grade_name: classInfo.gradeColumns.map((gradeCol) => gradeCol.name),
                        grade: classInfo.gradeColumns.map((gradeCol) => {
                            return {
                                col: gradeCol.name,
                                value: ''
                            };
                        })
                    };
                    return grade;
                }
            });
            classInfo.gradeList = gradeList;
            yield classInfo.save();
            const fullclassData = yield this.getClassDataWithStudentListQuery(req.params.classID);
            res.status(200).json({
                status: 'success',
                message: 'upload student list successfully',
                data: fullclassData.length ? fullclassData[0].studentList : []
            });
        });
        const multercloud = new multer_1.default(['xlsx', 'csv'], 15 * 1024 * 1024);
        this.router.put('/:classID/upload', _1.AuthController.protect, multercloud.single('studentlist'), multercloud.uploadCloud('studentlist'), (0, catch_error_1.default)(this.putStudentListWithFile));
        this.router.param('classID', validation_middleware_1.default.extractParams(['classID']));
        this.router.put('/:classID?', validation_middleware_1.default.validate(student_list_dto_1.default), _1.AuthController.protect, (0, catch_error_1.default)(this.putStudentList));
    }
}
exports.default = new StudentListController();
