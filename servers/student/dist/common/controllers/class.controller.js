"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const student_id_dto_1 = require("./../dtos/student-id.dto");
const class_model_1 = __importDefault(require("../models/class.model"));
const joinedClassInfo_model_1 = __importDefault(require("../models/joinedClassInfo.model"));
const express_1 = require("express");
const catch_error_1 = __importDefault(require("../utils/catch.error"));
const _1 = require(".");
const validation_middleware_1 = __importDefault(require("../middlewares/validation.middleware"));
const app_error_1 = __importDefault(require("../services/errors/app.error"));
const redis_1 = __importDefault(require("../redis"));
const join_class_1 = __importStar(require("../dtos/join-class"));
const mongoose_1 = __importDefault(require("mongoose"));
/*
 CLASS CONTROLLER
1. CREATE CLASS
2. GET ALL CLASS CREATED & JOINED
*/
class ClassController {
    classCacheKey(req) {
        var _a;
        return `class?id=${req.body.id}&owner=${(_a = req.user) === null || _a === void 0 ? void 0 : _a.id}`;
    }
    constructor() {
        this.path = "/classes";
        this.router = (0, express_1.Router)();
        this.classCacheRes = (req, res, next, data) => __awaiter(this, void 0, void 0, function* () {
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
        });
        this.getClass = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            if ((_a = req.body) === null || _a === void 0 ? void 0 : _a.id) {
                const joinedClassDetail = yield joinedClassInfo_model_1.default.aggregate([
                    {
                        $lookup: {
                            from: 'classes',
                            localField: 'class',
                            foreignField: '_id',
                            as: 'class',
                        },
                    },
                    {
                        $unwind: '$class',
                    },
                    {
                        $match: {
                            'class.slug': req.body.id,
                            user: new mongoose_1.default.Types.ObjectId((_b = req.user) === null || _b === void 0 ? void 0 : _b.id)
                        },
                    },
                    {
                        $limit: 1
                    }
                ]);
                if (joinedClassDetail.length === 0) {
                    return next(new app_error_1.default('No class found with that ID', 404));
                }
                const classArr = yield class_model_1.default.aggregate([
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
                            active: true,
                            'students._id': new mongoose_1.default.Types.ObjectId((_c = req.user) === null || _c === void 0 ? void 0 : _c.id),
                        },
                    },
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            slug: 1,
                            description: 1,
                            inviteCode: 1,
                            banner: 1,
                            cid: 1,
                            owner: {
                                _id: 1,
                                username: 1,
                                email: 1,
                                avatar: 1,
                                phoneNumber: 1,
                                firstname: 1,
                                lastname: 1,
                                role: 1,
                                address: 1,
                            },
                            lecturers: {
                                _id: 1,
                                username: 1,
                                email: 1,
                                avatar: 1,
                                phoneNumber: 1,
                                firstname: 1,
                                lastname: 1,
                                role: 1,
                                address: 1,
                            },
                            students: {
                                _id: 1,
                                username: 1,
                                email: 1,
                                avatar: 1,
                                phoneNumber: 1,
                                firstname: 1,
                                lastname: 1,
                                role: 1,
                                address: 1,
                            },
                            gradeColumns: {
                                $filter: {
                                    input: '$gradeColumns',
                                    as: 'gradeColumn',
                                    cond: {
                                        $ne: ['$$gradeColumn', []]
                                    }
                                }
                            },
                            gradeList: {
                                $filter: {
                                    input: '$gradeList',
                                    as: 'grade',
                                    cond: {
                                        $eq: ['$$grade.student_id', joinedClassDetail[0].studentID]
                                    }
                                },
                            },
                            studentList: {
                                student_id: 1,
                                full_name: 1,
                                email: 1,
                                _id: 1
                            },
                            studentPermission: 1,
                            lecturerPermission: 1,
                            ownerPermission: 1,
                            studentListUrl: 1,
                            gradeListUrl: 1,
                            createAt: 1,
                        }
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
                                                class: new mongoose_1.default.Types.ObjectId(joinedClassDetail[0].class._id)
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
                    { $limit: 1 }
                ]);
                const classInfo = classArr.length > 0 ? classArr[0] : null;
                if (!classInfo) {
                    return next(new app_error_1.default('No class found with that ID', 404));
                }
                if (classInfo.gradeList.length > 0) {
                    const filterCol = classInfo.gradeColumns.filter((el) => el.published === true);
                    classInfo.gradeList[0].grade_name = classInfo.gradeList[0].grade_name.filter((el) => filterCol.find((col) => col.name === el));
                    classInfo.gradeList[0].grade = classInfo.gradeList[0].grade.filter((el) => filterCol.find((col) => col.name === el.col));
                }
                const joinedClassInfo = yield joinedClassInfo_model_1.default.findOne({ user: (_d = req.user) === null || _d === void 0 ? void 0 : _d.id, class: classInfo._id }).lean();
                const students = yield joinedClassInfo_model_1.default.find({ class: classInfo._id, user: {
                        $in: classInfo.students.map((student) => student._id)
                    } }).populate('user').lean();
                const redisClient = redis_1.default.getClient();
                yield (redisClient === null || redisClient === void 0 ? void 0 : redisClient.setEx(this.classCacheKey(req), Number(process.env.REDIS_CACHE_EXPIRES), JSON.stringify(classInfo)));
                return res.status(200).json({
                    status: 'success',
                    message: 'Get class successfully',
                    data: Object.assign(Object.assign({}, classInfo), { studentID: (_e = joinedClassInfo === null || joinedClassInfo === void 0 ? void 0 : joinedClassInfo.studentID) !== null && _e !== void 0 ? _e : '', students: [...students.map((student) => (Object.assign(Object.assign({}, student.user), { studentID: student.studentID })))] })
                });
            }
            const classArr = yield class_model_1.default.aggregate([
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
                        'students._id': new mongoose_1.default.Types.ObjectId((_f = req.user) === null || _f === void 0 ? void 0 : _f.id),
                        active: true,
                    },
                },
            ]);
            const classesInfo = classArr;
            const redisClient = redis_1.default.getClient();
            yield (redisClient === null || redisClient === void 0 ? void 0 : redisClient.setEx(this.classCacheKey(req), Number(process.env.REDIS_CACHE_EXPIRES), JSON.stringify(classesInfo)));
            res.status(200).json({
                status: 'success',
                message: 'Get classes successfully',
                data: classesInfo !== null && classesInfo !== void 0 ? classesInfo : []
            });
        });
        this.invitedProtect = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _g;
            const classArr = yield class_model_1.default.aggregate([
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
                                'students._id': new mongoose_1.default.Types.ObjectId((_g = req.user) === null || _g === void 0 ? void 0 : _g.id)
                            }
                        ]
                    },
                },
                {
                    $limit: 1
                }
            ]);
            const classInfo = classArr.length > 0 ? classArr[0] : null;
            if (!classInfo) {
                return next();
            }
            return next(new app_error_1.default('You has joined this class', 404));
        });
        this.joinClass = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _h, _j;
            const classInfo = yield class_model_1.default.findOne({ slug: req.body.classID, inviteCode: req.body.code });
            if (!classInfo) {
                return next(new app_error_1.default('No class found with that ID', 404));
            }
            classInfo === null || classInfo === void 0 ? void 0 : classInfo.students.push((_h = req.user) === null || _h === void 0 ? void 0 : _h.id);
            yield joinedClassInfo_model_1.default.create({
                user: (_j = req.user) === null || _j === void 0 ? void 0 : _j.id,
                class: classInfo._id,
            });
            const joinedData = yield classInfo.save();
            const newClass = yield class_model_1.default.findOne({ slug: joinedData.slug }).populate('lecturers students owner').lean();
            const redisClient = redis_1.default.getClient();
            yield (redisClient === null || redisClient === void 0 ? void 0 : redisClient.del(this.classCacheKey(req)));
            return res.status(200).json({
                status: 'success',
                message: 'Join class successfully',
                data: Object.assign(Object.assign({}, newClass), { studentID: '' }),
            });
        });
        this.joinWithCode = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _k, _l;
            const classInfo = yield class_model_1.default.findOne({ inviteCode: req.body.code });
            if (!classInfo) {
                return next(new app_error_1.default('No class found with that Code', 404));
            }
            yield joinedClassInfo_model_1.default.create({
                user: (_k = req.user) === null || _k === void 0 ? void 0 : _k.id,
                class: classInfo._id,
            });
            classInfo === null || classInfo === void 0 ? void 0 : classInfo.students.push((_l = req.user) === null || _l === void 0 ? void 0 : _l.id);
            const joinedData = yield classInfo.save();
            const newClass = yield class_model_1.default.findOne({ slug: joinedData.slug }).populate('lecturers students owner').lean();
            const redisClient = redis_1.default.getClient();
            yield (redisClient === null || redisClient === void 0 ? void 0 : redisClient.del(this.classCacheKey(req)));
            return res.status(200).json({
                status: 'success',
                message: 'Join class successfully',
                data: Object.assign(Object.assign({}, newClass), { studentID: '' }),
            });
        });
        this.joinedProtect = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _m;
            const classArr = yield class_model_1.default.aggregate([
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
                                'students._id': new mongoose_1.default.Types.ObjectId((_m = req.user) === null || _m === void 0 ? void 0 : _m.id)
                            }
                        ]
                    },
                },
                {
                    $limit: 1
                }
            ]);
            const classInfo = classArr.length > 0 ? classArr[0] : null;
            if (!classInfo) {
                return next(new app_error_1.default('Cannot find class with that ID', 404));
            }
            next();
        });
        this.updateID = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _o, _p, _q;
            const joinedClassInfoArr = yield joinedClassInfo_model_1.default.aggregate([
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
                        user: new mongoose_1.default.Types.ObjectId((_o = req.user) === null || _o === void 0 ? void 0 : _o.id)
                    },
                },
                {
                    $limit: 1
                }
            ]);
            const joinedClassInfo = joinedClassInfoArr.length > 0 ? joinedClassInfoArr[0] : null;
            if (!joinedClassInfo) {
                return next(new app_error_1.default('Cannot find class with that ID123', 404));
            }
            const isUsed = yield joinedClassInfo_model_1.default.findOne({ class: joinedClassInfo.class, studentID: req.body.studentID });
            if (isUsed) {
                return next(new app_error_1.default('Student ID is used', 404));
            }
            const updatedClassInfo = yield joinedClassInfo_model_1.default.findOneAndUpdate({ class: joinedClassInfo.class, user: (_p = req.user) === null || _p === void 0 ? void 0 : _p.id }, { studentID: req.body.studentID }, { new: true });
            const redisClient = redis_1.default.getClient();
            yield (redisClient === null || redisClient === void 0 ? void 0 : redisClient.del(this.classCacheKey(req)));
            return res.status(200).json({
                status: 'success',
                message: 'Update student ID successfully',
                data: {
                    studentID: (_q = updatedClassInfo === null || updatedClassInfo === void 0 ? void 0 : updatedClassInfo.studentID) !== null && _q !== void 0 ? _q : ''
                }
            });
        });
        this.router.param('id', validation_middleware_1.default.extractParams(['id']));
        // this.router.get('/:id?', AuthController.protect, cacheMiddleware(this.classCacheKey, this.classCacheRes), catchAsync(this.getClass));
        this.router.get('/:id?', _1.AuthController.protect, (0, catch_error_1.default)(this.getClass));
        this.router.post('/join/:id', validation_middleware_1.default.validate(join_class_1.default), _1.AuthController.protect, this.invitedProtect, (0, catch_error_1.default)(this.joinClass));
        this.router.post('/join-with-code/:id?', validation_middleware_1.default.validate(join_class_1.JoinWithCodeDTO), _1.AuthController.protect, this.invitedProtect, (0, catch_error_1.default)(this.joinWithCode));
        this.router.patch('/student-id/:id', validation_middleware_1.default.validate(student_id_dto_1.StudentIDDTO), _1.AuthController.protect, this.joinedProtect, (0, catch_error_1.default)(this.updateID));
    }
}
exports.default = new ClassController();
