import { Server, Socket } from "socket.io";
import IEvent from "../interfaces/event";
import catchAsync from "../utils/catch.error";
import ClassModel, { IClass } from "../models/class.model";
import mongoose from "mongoose";
import ReviewModel from "../models/review.model";

class SubscribeEvent implements IEvent {
    public readonly event: string = 'subscribe';
    public readonly listener: (io: Server, socket: Socket, ...args: any[]) => void;

    constructor() {
        this.listener = this.onSubscribe;
    }

    private async onSubscribe(io: Server, socket: Socket, message: any) {
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
                        {
                            'lecturers._id': new mongoose.Types.ObjectId(message.user_id),
                        },
                        {
                            'owner._id': new mongoose.Types.ObjectId(message.user_id),
                        }
                    ]
                },
            },
        ]);

        const classesInfo: IClass[] = classArr;

        const allClassSlug = classesInfo.map((classInfo) => classInfo.slug).filter(slug => !socket.rooms.has(slug));
        const allClassId = classesInfo.map((classInfo) => classInfo._id).filter((ids: any) => !socket.rooms.has(ids.toString()));

        const allReview = await ReviewModel.find({ class: { $in: allClassId } }).select('_id').lean();
        const stringAllReview = allReview.map((review) => review._id.toString()).filter((ids: any) => !socket.rooms.has(ids));

        if (allClassSlug.length > 0 && allReview.length > 0) {
            socket.join([...allClassSlug, ...stringAllReview]);
        } else if (allClassSlug.length > 0) {
            socket.join([...allClassSlug]);
        }
    }
}

export default new SubscribeEvent();