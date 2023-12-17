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
const class_model_1 = __importDefault(require("../models/class.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const review_model_1 = __importDefault(require("../models/review.model"));
class SubscribeEvent {
    constructor() {
        this.event = 'subscribe';
        this.listener = this.onSubscribe;
    }
    onSubscribe(io, socket, message) {
        return __awaiter(this, void 0, void 0, function* () {
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
                            {
                                'lecturers._id': new mongoose_1.default.Types.ObjectId(message.user_id),
                            },
                            {
                                'owner._id': new mongoose_1.default.Types.ObjectId(message.user_id),
                            }
                        ]
                    },
                },
            ]);
            const classesInfo = classArr;
            const allClassSlug = classesInfo.map((classInfo) => classInfo.slug).filter(slug => !socket.rooms.has(slug));
            const allClassId = classesInfo.map((classInfo) => classInfo._id).filter((ids) => !socket.rooms.has(ids.toString()));
            const allReview = yield review_model_1.default.find({ class: { $in: allClassId } }).select('_id').lean();
            const stringAllReview = allReview.map((review) => review._id.toString()).filter((ids) => !socket.rooms.has(ids));
            if (allClassSlug.length > 0 && allReview.length > 0) {
                socket.join([...allClassSlug, ...stringAllReview]);
            }
            else if (allClassSlug.length > 0) {
                socket.join([...allClassSlug]);
            }
        });
    }
}
exports.default = new SubscribeEvent();
