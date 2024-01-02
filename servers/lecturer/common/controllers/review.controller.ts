import mongoose from 'mongoose';
import { NextFunction, Request, Response, Router } from 'express';
import IController from '../interfaces/controller';
import catchAsync from '../utils/catch.error';
import DTOValidation from '../middlewares/validation.middleware';
import cacheMiddleware from '../middlewares/cache.middleware';
import redis from '../redis';
import ReviewModel from '../models/review.model';
import ReviewDTO from '../dtos/review.dto';
import ClassModel from '../models/class.model';
import AppError from '../services/errors/app.error';
import JoinedClassInfoModel from '../models/joinedClassInfo.model';
import { AuthController } from '.';
import socketIO from '../socket';
import NotificationModel from '../models/notification.model';
import getFormatDateTime from '../utils/date.format';

class ReviewController implements IController {
    readonly path: string = '/review';
    readonly router: Router = Router();

    constructor() {
        this.router.param('classID', DTOValidation.extractParams(['classID']));

        this.router.post('/comment/:reviewID?', DTOValidation.extractParams(['reviewID']), AuthController.protect, catchAsync(this.putComment));
        this.router.get('/view/:reviewID?', AuthController.protect, catchAsync(this.getReviewById));
        this.router.post('/close/:reviewID?', DTOValidation.extractParams(['reviewID']), AuthController.protect, catchAsync(this.closeReview));

        this.router.post('/:classID?', DTOValidation.validate<ReviewDTO>(ReviewDTO), AuthController.protect, catchAsync(this.createReview));
        this.router.get('/:classID?', AuthController.protect, catchAsync(this.getReviews));
    }

    private async closeReview(req: Request, res: Response, next: NextFunction) {
        const reviewID = req.body.reviewID;
        if (!reviewID) {
            return next(new AppError('Review not found', 404));
        }

        if (!req.body.finalGrade && req.body.finalGrade !== 0) {
            return next(new AppError('Bad Request', 400));
        }

        const review = await ReviewModel.findById(reviewID).populate('class joinedInfo');

        if (!review) {
            return next(new AppError('Review not found', 404));
        }

        const classInfo = await ClassModel.findById(review.class);

        if (!classInfo) {
            return next(new AppError('Class not found', 404));
        }

        const gradeListItem = classInfo?.gradeList.find((el) => el.student_id === review.joinedInfo.studentID);
        const gradeOfStudent = gradeListItem?.grade.find((g) => g.col === review.composition);

        if (gradeOfStudent) gradeOfStudent.value = req.body.finalGrade;

        await classInfo.save();

        review.opened = false;
        review.finalGrade = req.body.finalGrade;

        await review.save();

        const newNotification = new NotificationModel({
            user: req.user?._id,
            class: review.class._id,
            message: `has closed a review of "${review.composition}" composition with final grade: ${req.body.finalGrade}.`,
            navigation: `/classes/reviews/${review.class.slug}/view/${review._id.toString()}`,
            formatedDate: getFormatDateTime(),
            receiver: [review.joinedInfo.user]
        });

        const createdData = await newNotification.save();

        const notification = await NotificationModel.findById(createdData._id).populate('user class').lean();

        const io = socketIO.getIO();

        io.sockets.in(req.body.reviewID).emit('notification', {
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

        io.sockets.in(req.body.reviewID).emit('review:close', {
            finalGrade: req.body.finalGrade,
        });

        res.status(200).json({
            status: 'success',
            data: {
                review,
            },
        });
    }

    private async putComment(req: Request, res: Response, next: NextFunction) {
        if (!req.body.reviewID) {
            return next(new AppError('The review not found', 404));
        }

        if (!req.body.content) {
            return next(new AppError('Bad Request', 400));
        }
    
        const review: any = await ReviewModel.findById(req.body.reviewID).populate('class joinedInfo');
        if (!review) {
            return next(new AppError('The review not found', 404));
        }

        review.comments.push({
            sender: req.user?._id,
            content: req.body.content,
            createdAt: new Date(Date.now() - 1000),
            formatedDate: getFormatDateTime(),
        });

        await review.save();

        const commentsInfo = await ReviewModel.findById(req.body.reviewID).populate('comments.sender');

        const io = socketIO.getIO();

        io.sockets.in(req.body.reviewID).emit('review:comment', {
            comments: commentsInfo?.comments ?? [],
        });

        const newNotification = new NotificationModel({
            user: req.user?._id,
            class: review.class,
            message: `has replied a review of "${review.composition}" composition.`,
            navigation: `/classes/reviews/${review.class.slug}/view/${review._id.toString()}`,
            formatedDate: getFormatDateTime(),
            receiver: [review.joinedInfo.user]
        });

        const createdData = await newNotification.save();

        const notification = await NotificationModel.findById(createdData._id).populate('user class').lean();

        io.sockets.in(req.body.reviewID).emit('notification', {
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

        res.status(200).json({
            status: 'success',
            data: commentsInfo?.comments ?? [],
        });
    }

    private async getReviewById(req: Request, res: Response, next: NextFunction) {
        const reviewID = req.params.reviewID;
        if (!reviewID) {
            return next(new AppError('Review not found', 404));
        }

        const review = await ReviewModel.findById(reviewID).populate('joinedInfo comments.sender').lean();

        if (!review) {
            return next(new AppError('Review not found', 404));
        }

        const joinedInfo = await JoinedClassInfoModel.findById(review.joinedInfo._id).populate('user').lean();

        if (!joinedInfo) {
            return next(new AppError('Review not found', 404));
        }

        res.status(200).json({
            status: 'success',
            data: {
                review: {
                    ...review,
                    joinedInfo: {
                        ...review.joinedInfo,
                        user: joinedInfo?.user,
                    }
                },
            },
        });
    }

    private async getReviews(req: Request, res: Response, next: NextFunction) {
        const classID = req.params.classID;
        if (!classID) {
            return next(new AppError('Class not found', 404));
        }

        const classInfo = await ClassModel.findOne({ slug: classID }).select('_id').lean();

        if (!classInfo) {
            return next(new AppError('Class not found', 404));
        }

        const reviews = await ReviewModel.find({ 
            class: new mongoose.Types.ObjectId(classInfo._id),
        }).populate('joinedInfo comments.sender').sort({ createdAt: -1 }).lean();

        res.status(200).json({
            status: 'success',
            data: {
                reviews,
            },
        });
    }

    private async createReview(req: Request, res: Response, next: NextFunction) {
        const reviewInfo = req.body as ReviewDTO;

        const classInfo = await ClassModel.findOne({ slug: reviewInfo.classID }).lean();

        if (!classInfo) {
            return next(new AppError('Class not found', 404));
        }

        const joinedClassInfo = await JoinedClassInfoModel.findOne({ class: new mongoose.Types.ObjectId(classInfo._id), user: new mongoose.Types.ObjectId(req.user?._id) });

        if (!joinedClassInfo) {
            return next(new AppError('You are not in this class', 403));
        }

        const reviewExist = await ReviewModel.findOne({ 
            class: new mongoose.Types.ObjectId(classInfo._id), 
            joinedInfo: new mongoose.Types.ObjectId(joinedClassInfo._id),
            composition: reviewInfo.composition,
        });

        if (reviewExist) {
            return next(new AppError(`You have already reviewed "${reviewInfo.composition}" composition !`, 403));
        }

        const review = await ReviewModel.create({
            class: classInfo._id,
            user: req.user?._id,
            joinedInfo: joinedClassInfo._id,
            ...reviewInfo,
        });

        const createAt = getFormatDateTime();

        const newNotification = new NotificationModel({
            user: req.user?._id,
            class: classInfo._id,
            message: `has requested a review of "${review.composition}" composition.`,
            navigation: `/classes/reviews/${classInfo.slug}/view/${review._id.toString()}`,
            formatedDate: createAt,
            receiver: [...classInfo.lecturers, classInfo.owner]
        });

        const createdData = await newNotification.save();

        const notification = await NotificationModel.findById(createdData._id).populate('user class').lean();

        const io = socketIO.getIO();
            
        io.sockets.in(reviewInfo.classID).emit('notification', {
            username: joinedClassInfo.studentID,
            avatar: req.user?.avatar,
            createAt: notification?.createdAt,
            message: notification?.message,
            navigation: notification?.navigation,
            formatedDate: notification?.formatedDate,
            notification: {
                ...notification
            }
        });

        res.status(201).json({
            status: 'success',
            data: {
                review,
            },
        });
    }
}

export default new ReviewController();