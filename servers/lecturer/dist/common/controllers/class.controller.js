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
const class_model_1 = __importDefault(require("./../models/class.model"));
const create_class_dto_1 = require("./../dtos/create-class.dto");
const express_1 = require("express");
const catch_error_1 = __importDefault(require("../utils/catch.error"));
const _1 = require(".");
const validation_middleware_1 = __importDefault(require("../middlewares/validation.middleware"));
const app_error_1 = __importDefault(require("../services/errors/app.error"));
const redis_1 = __importDefault(require("../redis"));
const mailer_builder_1 = __importDefault(require("../services/mailer.builder"));
const path_1 = __importDefault(require("path"));
const handlebars_1 = __importDefault(require("handlebars"));
const fs = __importStar(require("fs"));
const invite_class_dto_1 = __importDefault(require("../dtos/invite-class.dto"));
const jwt_1 = __importDefault(require("../utils/jwt"));
const join_class_1 = __importDefault(require("../dtos/join-class"));
const mongoose_1 = __importDefault(require("mongoose"));
const joinedClassInfo_model_1 = __importDefault(require("../models/joinedClassInfo.model"));
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
        this.deleteClass = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const classInfo = yield class_model_1.default.findOne({ slug: req.params.id }).lean();
            if (!classInfo) {
                return next(new app_error_1.default('No class found with that ID', 404));
            }
            yield joinedClassInfo_model_1.default.deleteMany({ class: classInfo._id });
            yield class_model_1.default.deleteOne({ slug: req.body.id });
            const redisClient = redis_1.default.getClient();
            yield (redisClient === null || redisClient === void 0 ? void 0 : redisClient.del(this.classCacheKey(req)));
            res.status(200).json({
                status: 'success',
                message: 'Delete class successfully',
                data: {}
            });
        });
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
            var _a, _b, _c, _d, _e;
            if ((_a = req.body) === null || _a === void 0 ? void 0 : _a.id) {
                const classInfoId = yield class_model_1.default.findOne({ slug: req.body.id }).lean();
                if (!classInfoId) {
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
                            $and: [
                                { slug: req.body.id },
                                {
                                    $or: [
                                        { 'lecturers._id': new mongoose_1.default.Types.ObjectId((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) },
                                        { 'owner._id': new mongoose_1.default.Types.ObjectId((_c = req.user) === null || _c === void 0 ? void 0 : _c.id) }
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
                    { $limit: 1 }
                ]);
                const classInfo = classArr.length > 0 ? classArr[0] : null;
                if (!classInfo) {
                    return next(new app_error_1.default('No class found with that ID', 404));
                }
                const students = yield joinedClassInfo_model_1.default.find({ class: classInfo._id, user: {
                        $in: classInfo.students.map((student) => student._id)
                    } }).populate('user').lean();
                const redisClient = redis_1.default.getClient();
                yield (redisClient === null || redisClient === void 0 ? void 0 : redisClient.setEx(this.classCacheKey(req), Number(process.env.REDIS_CACHE_EXPIRES), JSON.stringify(classInfo)));
                return res.status(200).json({
                    status: 'success',
                    message: 'Get class successfully',
                    data: Object.assign(Object.assign({}, classInfo), { students: [...students.map((student) => (Object.assign(Object.assign({}, student.user), { studentID: student.studentID })))] })
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
                        $or: [
                            { 'lecturers._id': new mongoose_1.default.Types.ObjectId((_d = req.user) === null || _d === void 0 ? void 0 : _d.id) },
                            { 'owner._id': new mongoose_1.default.Types.ObjectId((_e = req.user) === null || _e === void 0 ? void 0 : _e.id) }
                        ]
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
        this.createClass = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _f;
            const { name, cid } = req.body;
            const classCreated = yield class_model_1.default.create({
                name,
                cid,
                owner: req.user._id
            });
            const classInfo = yield class_model_1.default.findOne({ _id: classCreated.id, owner: (_f = req.user) === null || _f === void 0 ? void 0 : _f.id }).populate('owner').lean();
            const redisClient = redis_1.default.getClient();
            yield (redisClient === null || redisClient === void 0 ? void 0 : redisClient.del(this.classCacheKey(req)));
            res.json({
                status: 'success',
                message: 'Create class successfully',
                data: classInfo
            });
        });
        this.ownerProtect = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _g;
            const classInfo = yield class_model_1.default.findOne({ slug: req.body.id, owner: (_g = req.user) === null || _g === void 0 ? void 0 : _g.id }).lean();
            if (!classInfo) {
                return next(new app_error_1.default('No class found with that ID', 404));
            }
            req.class = classInfo;
            next();
        });
        this.invitedProtect = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _h, _j;
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
                                    { 'lecturers._id': new mongoose_1.default.Types.ObjectId((_h = req.user) === null || _h === void 0 ? void 0 : _h.id) },
                                    { owner: new mongoose_1.default.Types.ObjectId((_j = req.user) === null || _j === void 0 ? void 0 : _j.id) }
                                ]
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
        this.sendInvitedMessage = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _k, _l;
            const inviteInfo = req.body;
            const source = fs.readFileSync(path_1.default.join(__dirname, '../../templates/invitationMailer/index.html'), 'utf8').toString();
            const template = handlebars_1.default.compile(source);
            const inviteCode = yield jwt_1.default.createToken({
                email: (_k = req.user) === null || _k === void 0 ? void 0 : _k.email,
                classID: req.class.slug
            }, {
                expiresIn: 10 * 60 * 60 * 1000
            });
            const props = {
                sender: (_l = req.user) === null || _l === void 0 ? void 0 : _l.username,
                classID: req.class.cid,
                className: req.class.name,
                role: inviteInfo.role,
                inviteLink: (inviteInfo.role === 'lecturer') ? inviteInfo.inviteLink.replace(/\?code=\w{7}/, `?code=${inviteCode}`) : inviteInfo.inviteLink
            };
            const htmlToSend = template(props);
            const emailList = req.body.emails;
            mailer_builder_1.default.sendMail({
                to: emailList,
                subject: 'Class invitation',
                html: htmlToSend
            });
            res.status(200).json({
                status: 'success',
                message: 'Send invited message successfully',
                data: {}
            });
        });
        this.joinClass = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _m;
            const joinInfo = req.body;
            const decoded = yield jwt_1.default.verifyToken(joinInfo.code);
            if (decoded.classID !== req.body.classID) {
                return next(new app_error_1.default('Invalid invitation code', 400));
            }
            const classInfo = yield class_model_1.default.findOne({ slug: decoded.classID });
            if (!classInfo) {
                return next(new app_error_1.default('No class found with that ID', 404));
            }
            classInfo === null || classInfo === void 0 ? void 0 : classInfo.lecturers.push((_m = req.user) === null || _m === void 0 ? void 0 : _m.id);
            const joinedData = yield classInfo.save();
            const newClass = yield class_model_1.default.findOne({ slug: joinedData.slug }).populate('lecturers students owner').lean();
            const redisClient = redis_1.default.getClient();
            yield (redisClient === null || redisClient === void 0 ? void 0 : redisClient.del(this.classCacheKey(req)));
            return res.status(200).json({
                status: 'success',
                message: 'Join class successfully',
                data: newClass
            });
        });
        this.router.post('/', validation_middleware_1.default.validate(create_class_dto_1.CreateClassDTO), _1.AuthController.protect, (0, catch_error_1.default)(this.createClass));
        this.router.param('id', validation_middleware_1.default.extractParams(['id']));
        // this.router.get('/:id?', AuthController.protect, cacheMiddleware(this.classCacheKey, this.classCacheRes), catchAsync(this.getClass));
        this.router.get('/:id?', _1.AuthController.protect, (0, catch_error_1.default)(this.getClass));
        this.router.post('/invite/:id', validation_middleware_1.default.validate(invite_class_dto_1.default), _1.AuthController.protect, this.ownerProtect, (0, catch_error_1.default)(this.sendInvitedMessage));
        this.router.post('/join/:id', validation_middleware_1.default.validate(join_class_1.default), _1.AuthController.protect, this.invitedProtect, (0, catch_error_1.default)(this.joinClass));
        this.router.delete('/:id?', _1.AuthController.protect, this.ownerProtect, (0, catch_error_1.default)(this.deleteClass));
    }
}
exports.default = new ClassController();
