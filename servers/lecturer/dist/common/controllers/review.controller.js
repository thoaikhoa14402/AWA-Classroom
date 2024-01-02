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
const mongoose_1 = __importDefault(require("mongoose"));
const express_1 = require("express");
const catch_error_1 = __importDefault(require("../utils/catch.error"));
const validation_middleware_1 = __importDefault(require("../middlewares/validation.middleware"));
const review_model_1 = __importDefault(require("../models/review.model"));
const review_dto_1 = __importDefault(require("../dtos/review.dto"));
const class_model_1 = __importDefault(require("../models/class.model"));
const app_error_1 = __importDefault(require("../services/errors/app.error"));
const joinedClassInfo_model_1 = __importDefault(require("../models/joinedClassInfo.model"));
const _1 = require(".");
const socket_1 = __importDefault(require("../socket"));
const notification_model_1 = __importDefault(require("../models/notification.model"));
const date_format_1 = __importDefault(require("../utils/date.format"));
class ReviewController {
    constructor() {
        this.path = '/review';
        this.router = (0, express_1.Router)();
        this.router.param('classID', validation_middleware_1.default.extractParams(['classID']));
        this.router.post('/comment/:reviewID?', validation_middleware_1.default.extractParams(['reviewID']), _1.AuthController.protect, (0, catch_error_1.default)(this.putComment));
        this.router.get('/view/:reviewID?', _1.AuthController.protect, (0, catch_error_1.default)(this.getReviewById));
        this.router.post('/close/:reviewID?', validation_middleware_1.default.extractParams(['reviewID']), _1.AuthController.protect, (0, catch_error_1.default)(this.closeReview));
        this.router.post('/:classID?', validation_middleware_1.default.validate(review_dto_1.default), _1.AuthController.protect, (0, catch_error_1.default)(this.createReview));
        this.router.get('/:classID?', _1.AuthController.protect, (0, catch_error_1.default)(this.getReviews));
    }
    closeReview(req, res, next) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const reviewID = req.body.reviewID;
            if (!reviewID) {
                return next(new app_error_1.default('Review not found', 404));
            }
            if (!req.body.finalGrade && req.body.finalGrade !== 0) {
                return next(new app_error_1.default('Bad Request', 400));
            }
            const review = yield review_model_1.default.findById(reviewID).populate('class joinedInfo');
            if (!review) {
                return next(new app_error_1.default('Review not found', 404));
            }
            const classInfo = yield class_model_1.default.findById(review.class);
            if (!classInfo) {
                return next(new app_error_1.default('Class not found', 404));
            }
            const gradeListItem = classInfo === null || classInfo === void 0 ? void 0 : classInfo.gradeList.find((el) => el.student_id === review.joinedInfo.studentID);
            const gradeOfStudent = gradeListItem === null || gradeListItem === void 0 ? void 0 : gradeListItem.grade.find((g) => g.col === review.composition);
            if (gradeOfStudent)
                gradeOfStudent.value = req.body.finalGrade;
            yield classInfo.save();
            review.opened = false;
            review.finalGrade = req.body.finalGrade;
            yield review.save();
            const newNotification = new notification_model_1.default({
                user: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
                class: review.class._id,
                message: `has closed a review of "${review.composition}" composition with final grade: ${req.body.finalGrade}.`,
                navigation: `/classes/reviews/${review.class.slug}/view/${review._id.toString()}`,
                formatedDate: (0, date_format_1.default)(),
                receiver: [review.joinedInfo.user]
            });
            const createdData = yield newNotification.save();
            const notification = yield notification_model_1.default.findById(createdData._id).populate('user class').lean();
            const io = socket_1.default.getIO();
            io.sockets.in(req.body.reviewID).emit('notification', {
                username: (_b = req.user) === null || _b === void 0 ? void 0 : _b.username,
                avatar: (_c = req.user) === null || _c === void 0 ? void 0 : _c.avatar,
                createAt: notification === null || notification === void 0 ? void 0 : notification.createdAt,
                message: notification === null || notification === void 0 ? void 0 : notification.message,
                navigation: notification === null || notification === void 0 ? void 0 : notification.navigation,
                formatedDate: notification === null || notification === void 0 ? void 0 : notification.formatedDate,
                notification: Object.assign({}, notification)
            });
            io.sockets.in(req.body.reviewID).emit('review:close', {
                finalGrade: req.body.finalGrade,
            });
            res.status(200).json({
                status: 'success',
                data: {
                    review,
                },
            });
        });
    }
    putComment(req, res, next) {
        var _a, _b, _c, _d, _e, _f;
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.body.reviewID) {
                return next(new app_error_1.default('The review not found', 404));
            }
            if (!req.body.content) {
                return next(new app_error_1.default('Bad Request', 400));
            }
            const review = yield review_model_1.default.findById(req.body.reviewID).populate('class joinedInfo');
            if (!review) {
                return next(new app_error_1.default('The review not found', 404));
            }
            review.comments.push({
                sender: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
                content: req.body.content,
                createdAt: new Date(Date.now() - 1000),
                formatedDate: (0, date_format_1.default)(),
            });
            yield review.save();
            const commentsInfo = yield review_model_1.default.findById(req.body.reviewID).populate('comments.sender');
            const io = socket_1.default.getIO();
            io.sockets.in(req.body.reviewID).emit('review:comment', {
                comments: (_b = commentsInfo === null || commentsInfo === void 0 ? void 0 : commentsInfo.comments) !== null && _b !== void 0 ? _b : [],
            });
            const newNotification = new notification_model_1.default({
                user: (_c = req.user) === null || _c === void 0 ? void 0 : _c._id,
                class: review.class,
                message: `has replied a review of "${review.composition}" composition.`,
                navigation: `/classes/reviews/${review.class.slug}/view/${review._id.toString()}`,
                formatedDate: (0, date_format_1.default)(),
                receiver: [review.joinedInfo.user]
            });
            const createdData = yield newNotification.save();
            const notification = yield notification_model_1.default.findById(createdData._id).populate('user class').lean();
            io.sockets.in(req.body.reviewID).emit('notification', {
                username: (_d = req.user) === null || _d === void 0 ? void 0 : _d.username,
                avatar: (_e = req.user) === null || _e === void 0 ? void 0 : _e.avatar,
                createAt: notification === null || notification === void 0 ? void 0 : notification.createdAt,
                message: notification === null || notification === void 0 ? void 0 : notification.message,
                navigation: notification === null || notification === void 0 ? void 0 : notification.navigation,
                formatedDate: notification === null || notification === void 0 ? void 0 : notification.formatedDate,
                notification: Object.assign({}, notification)
            });
            res.status(200).json({
                status: 'success',
                data: (_f = commentsInfo === null || commentsInfo === void 0 ? void 0 : commentsInfo.comments) !== null && _f !== void 0 ? _f : [],
            });
        });
    }
    getReviewById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const reviewID = req.params.reviewID;
            if (!reviewID) {
                return next(new app_error_1.default('Review not found', 404));
            }
            const review = yield review_model_1.default.findById(reviewID).populate('joinedInfo comments.sender').lean();
            if (!review) {
                return next(new app_error_1.default('Review not found', 404));
            }
            res.status(200).json({
                status: 'success',
                data: {
                    review,
                },
            });
        });
    }
    getReviews(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const classID = req.params.classID;
            if (!classID) {
                return next(new app_error_1.default('Class not found', 404));
            }
            const classInfo = yield class_model_1.default.findOne({ slug: classID }).select('_id').lean();
            if (!classInfo) {
                return next(new app_error_1.default('Class not found', 404));
            }
            const reviews = yield review_model_1.default.find({
                class: new mongoose_1.default.Types.ObjectId(classInfo._id),
            }).populate('joinedInfo comments.sender').sort({ createdAt: -1 }).lean();
            res.status(200).json({
                status: 'success',
                data: {
                    reviews,
                },
            });
        });
    }
    createReview(req, res, next) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            const reviewInfo = req.body;
            const classInfo = yield class_model_1.default.findOne({ slug: reviewInfo.classID }).lean();
            if (!classInfo) {
                return next(new app_error_1.default('Class not found', 404));
            }
            const joinedClassInfo = yield joinedClassInfo_model_1.default.findOne({ class: new mongoose_1.default.Types.ObjectId(classInfo._id), user: new mongoose_1.default.Types.ObjectId((_a = req.user) === null || _a === void 0 ? void 0 : _a._id) });
            if (!joinedClassInfo) {
                return next(new app_error_1.default('You are not in this class', 403));
            }
            const reviewExist = yield review_model_1.default.findOne({
                class: new mongoose_1.default.Types.ObjectId(classInfo._id),
                joinedInfo: new mongoose_1.default.Types.ObjectId(joinedClassInfo._id),
                composition: reviewInfo.composition,
            });
            if (reviewExist) {
                return next(new app_error_1.default(`You have already reviewed "${reviewInfo.composition}" composition !`, 403));
            }
            const review = yield review_model_1.default.create(Object.assign({ class: classInfo._id, user: (_b = req.user) === null || _b === void 0 ? void 0 : _b._id, joinedInfo: joinedClassInfo._id }, reviewInfo));
            const createAt = (0, date_format_1.default)();
            const newNotification = new notification_model_1.default({
                user: (_c = req.user) === null || _c === void 0 ? void 0 : _c._id,
                class: classInfo._id,
                message: `has requested a review of "${review.composition}" composition.`,
                navigation: `/classes/reviews/${classInfo.slug}/view/${review._id.toString()}`,
                formatedDate: createAt,
                receiver: [...classInfo.lecturers, classInfo.owner]
            });
            const createdData = yield newNotification.save();
            const notification = yield notification_model_1.default.findById(createdData._id).populate('user class').lean();
            const io = socket_1.default.getIO();
            io.sockets.in(reviewInfo.classID).emit('notification', {
                username: joinedClassInfo.studentID,
                avatar: (_d = req.user) === null || _d === void 0 ? void 0 : _d.avatar,
                createAt: notification === null || notification === void 0 ? void 0 : notification.createdAt,
                message: notification === null || notification === void 0 ? void 0 : notification.message,
                navigation: notification === null || notification === void 0 ? void 0 : notification.navigation,
                formatedDate: notification === null || notification === void 0 ? void 0 : notification.formatedDate,
                notification: Object.assign({}, notification)
            });
            res.status(201).json({
                status: 'success',
                data: {
                    review,
                },
            });
        });
    }
}
exports.default = new ReviewController();
