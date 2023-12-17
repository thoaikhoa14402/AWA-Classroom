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
const grade_list_dto_1 = require("./../dtos/grade-list.dto");
const express_1 = require("express");
const catch_error_1 = __importDefault(require("../utils/catch.error"));
const _1 = require(".");
const validation_middleware_1 = __importDefault(require("../middlewares/validation.middleware"));
const app_error_1 = __importDefault(require("../services/errors/app.error"));
const grade_structure_dto_1 = __importDefault(require("../dtos/grade-structure.dto"));
const class_model_1 = __importDefault(require("../models/class.model"));
const notification_model_1 = __importDefault(require("../models/notification.model"));
const xlsx_1 = __importDefault(require("xlsx"));
const stream_1 = require("stream");
const multer_1 = __importDefault(require("../multer"));
const cloudinary_1 = __importDefault(require("../cloudinary"));
const axios_1 = __importDefault(require("axios"));
const socket_1 = __importDefault(require("../socket"));
const date_format_1 = __importDefault(require("../utils/date.format"));
const mongoose_1 = __importDefault(require("mongoose"));
/*
 USER CONTROLLER
1. GET COMPOSITION
*/
class GradeController {
    gradeCachekey(req) {
        return `grade?id=${req.params.id}`;
    }
    constructor() {
        this.path = "/grade";
        this.router = (0, express_1.Router)();
        this.getClassDataWithGradeListQuery = (classID) => __awaiter(this, void 0, void 0, function* () {
            const classInfoId = yield class_model_1.default.findOne({ slug: classID }).select('_id').lean();
            if (!classInfoId) {
                return [];
            }
            return yield class_model_1.default.aggregate([
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
                                            class: new mongoose_1.default.Types.ObjectId(classInfoId._id)
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
        });
        this.putGradeComposition = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const gradeCompositionInfo = req.body;
            const classInfo = yield class_model_1.default.findOne({ slug: gradeCompositionInfo.classID });
            if (!classInfo) {
                return next(new app_error_1.default('Class not found!', 404));
            }
            const updatedComposition = classInfo.gradeColumns.filter(el => !el.published && gradeCompositionInfo.gradeCompositions.find(el2 => el2.published && el2.name === el.name));
            classInfo.gradeColumns = gradeCompositionInfo.gradeCompositions;
            const newClassData = yield classInfo.save();
            if (updatedComposition.length > 0) {
                const publishedCompositions = updatedComposition.map(el => el.name).join(', ');
                const createAt = (0, date_format_1.default)();
                const newNotification = new notification_model_1.default({
                    user: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
                    class: newClassData._id,
                    message: `has published "${publishedCompositions}" composition.`,
                    navigation: `/classes/grades/${newClassData === null || newClassData === void 0 ? void 0 : newClassData.slug}`,
                    formatedDate: createAt,
                    receiver: [...newClassData.students, ...newClassData.lecturers]
                });
                const createdData = yield newNotification.save();
                const notification = yield notification_model_1.default.findById(createdData._id).populate('user class').lean();
                const io = socket_1.default.getIO();
                io.sockets.in(gradeCompositionInfo.classID).emit('notification', {
                    username: (_b = req.user) === null || _b === void 0 ? void 0 : _b.username,
                    avatar: (_c = req.user) === null || _c === void 0 ? void 0 : _c.avatar,
                    createAt: notification === null || notification === void 0 ? void 0 : notification.createdAt,
                    message: notification === null || notification === void 0 ? void 0 : notification.message,
                    navigation: notification === null || notification === void 0 ? void 0 : notification.navigation,
                    formatedDate: notification === null || notification === void 0 ? void 0 : notification.formatedDate,
                    notification: Object.assign({}, notification)
                });
            }
            res.status(200).json({
                status: 'success',
                data: newClassData.gradeColumns
            });
        });
        this.requestDownloadTemplate = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const classID = req.body.classID;
            if (!classID) {
                return next(new app_error_1.default('Class not found!', 404));
            }
            const classInfo = yield class_model_1.default.findOne({ slug: classID });
            if (!classInfo) {
                return next(new app_error_1.default('Class not found!', 404));
            }
            const gradeCol = classInfo.gradeColumns.map((col) => col.name);
            const gradeTemplate = ['Student ID', ...gradeCol];
            const wb = xlsx_1.default.utils.book_new();
            const studentIDs = classInfo.studentList.map((student) => student.student_id);
            const ws = xlsx_1.default.utils.aoa_to_sheet([gradeTemplate, ...studentIDs.map((studentID) => [studentID])]);
            xlsx_1.default.utils.book_append_sheet(wb, ws, 'Grade Template');
            const buffer = xlsx_1.default.write(wb, { type: 'buffer', bookType: 'xlsx' });
            const bufferStream = new stream_1.PassThrough();
            bufferStream.end(Buffer.from(buffer));
            bufferStream.pipe(res);
        });
        this.putGradeListWithFile = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const classID = req.params.classID;
            if (!classID) {
                return next(new app_error_1.default('Class not found!', 404));
            }
            const classInfo = yield class_model_1.default.findOne({ slug: classID });
            if (!classInfo) {
                return next(new app_error_1.default('Class not found!', 404));
            }
            const gradelistURL = classInfo.gradeListUrl;
            if (gradelistURL === null || gradelistURL === void 0 ? void 0 : gradelistURL.includes('cloudinary')) {
                const matches = RegExp(/gradelist\/[a-zA-Z0-9]+/).exec(gradelistURL);
                yield cloudinary_1.default.delete([matches[0]]);
            }
            classInfo.gradeListUrl = req.cloudinaryResult.secure_url || req.cloudinaryResult.url;
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
            const availableHeader = header.map((colName) => {
                if (colName === 'Student ID')
                    return 'student_id';
                if (classInfo.gradeColumns.find((gradeCol) => gradeCol.name === colName)) {
                    return colName;
                }
            });
            const gradeList = filteredData.map((row) => {
                const student = {};
                availableHeader.forEach((column, index) => {
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
            yield classInfo.save();
            const fullclassData = yield this.getClassDataWithGradeListQuery(req.params.classID);
            res.status(200).json({
                status: 'success',
                message: 'Upload grade list successfully',
                data: fullclassData.length ? fullclassData[0].gradeList : [],
            });
        });
        this.putGradeList = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const gradeListInfo = req.body;
            if (!gradeListInfo.classID) {
                return next(new app_error_1.default('Class not found!', 404));
            }
            const classInfo = yield class_model_1.default.findOne({ slug: gradeListInfo.classID });
            if (!classInfo) {
                return next(new app_error_1.default('Class not found!', 404));
            }
            classInfo.gradeList = gradeListInfo.gradeList;
            yield classInfo.save();
            const fullclassData = yield this.getClassDataWithGradeListQuery(gradeListInfo.classID);
            res.status(200).json({
                status: 'success',
                message: 'Upload grade list successfully',
                data: fullclassData.length ? fullclassData[0].gradeList : [],
            });
        });
        this.requestDownloadGradeList = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const classID = req.body.classID;
            if (!classID) {
                return next(new app_error_1.default('Class not found!', 404));
            }
            const classInfo = yield class_model_1.default.findOne({ slug: classID });
            if (!classInfo) {
                return next(new app_error_1.default('Class not found!', 404));
            }
            const gradeCol = classInfo.gradeColumns.map((col) => col.name);
            const gradeList = classInfo.gradeList.map((student) => {
                const studentID = student.student_id;
                const grade = student.grade.map((grade) => grade.value);
                let gradeTotal = classInfo.gradeColumns.reduce((acc, gradeCol, index) => {
                    var _a, _b;
                    return acc + ((_a = grade[index]) !== null && _a !== void 0 ? _a : 0) * ((_b = gradeCol.scale) !== null && _b !== void 0 ? _b : 0) / 100;
                }, 0);
                if (isNaN(gradeTotal)) {
                    gradeTotal = 0;
                }
                return [studentID, ...grade, gradeTotal];
            });
            const wb = xlsx_1.default.utils.book_new();
            const ws = xlsx_1.default.utils.aoa_to_sheet([['Student ID', ...gradeCol, 'Total'], ...gradeList]);
            xlsx_1.default.utils.book_append_sheet(wb, ws, 'Grade List');
            const buffer = xlsx_1.default.write(wb, { type: 'buffer', bookType: 'xlsx' });
            const bufferStream = new stream_1.PassThrough();
            bufferStream.end(Buffer.from(buffer));
            bufferStream.pipe(res);
        });
        this.router.param('classID', validation_middleware_1.default.extractParams(['classID']));
        this.router.put('/composition/:classID?', validation_middleware_1.default.validate(grade_structure_dto_1.default), _1.AuthController.protect, (0, catch_error_1.default)(this.putGradeComposition));
        this.router.post('/template/export', _1.AuthController.protect, (0, catch_error_1.default)(this.requestDownloadTemplate));
        const multercloud = new multer_1.default(['xlsx', 'csv'], 15 * 1024 * 1024);
        this.router.put('/grade-list/:classID/upload', _1.AuthController.protect, multercloud.single('gradelist'), multercloud.uploadCloud('gradelist'), (0, catch_error_1.default)(this.putGradeListWithFile));
        this.router.put('/list/:classID?', validation_middleware_1.default.validate(grade_list_dto_1.GradeListDTO), _1.AuthController.protect, (0, catch_error_1.default)(this.putGradeList));
        this.router.post('/list/:classID/download', _1.AuthController.protect, (0, catch_error_1.default)(this.requestDownloadGradeList));
    }
}
exports.default = new GradeController();
