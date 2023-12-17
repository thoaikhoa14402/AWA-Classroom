import mongoose from 'mongoose';
import JoinedClassInfoModel, { IJoinedClassInfo } from './joinedClassInfo.model';
import ClassModel, { IClass } from './class.model';
import getFormatDateTime from '../utils/date.format';
import UserModel, { IUser } from './user.model';

export interface IComment {
    _id?: mongoose.Types.ObjectId;
    id: string;
    sender: IUser;
    content: string;
    createdAt: Date;
    formatedDate: string;
}

export interface IReview {
    _id?: mongoose.Types.ObjectId;
    id: string;
    class: IClass;
    joinedInfo: IJoinedClassInfo;
    composition: string;
    grade: number;
    reason: string;
    expected: number;
    opened: boolean;
    comments: IComment[];
    finalGrade?: number;
    createdAt: Date;
    formatedDate: string;
}

const ReviewSchema = new mongoose.Schema<IReview>(
    {
        class: {
            type: mongoose.Types.ObjectId,
            ref: ClassModel,
        },
        joinedInfo: {
            type: mongoose.Types.ObjectId,
            ref: JoinedClassInfoModel,
        },
        composition: {
            type: String,
        },
        grade: {
            type: Number,
        },
        reason: {
            type: String,
        },
        expected: {
            type: Number,
        },
        opened: {
            type: Boolean,
            default: true,
        },
        comments: {
            type: [
                {
                    sender: {
                        type: mongoose.Types.ObjectId,
                        ref: UserModel,
                    },
                    content: {
                        type: String,
                    },
                    createdAt: {
                        type: Date,
                        default: Date.now()
                    },
                    formatedDate: {
                        type: String,
                    }
                }
            ],
            default: []
        },
        finalGrade: {
            type: Number,
        },
        createdAt: {
            type: Date,
            default: Date.now()
        },
        formatedDate: {
            type: String,
        }
    },
    {
        toJSON: {
            virtuals: true,
            versionKey: false,
        },
        toObject: {
            virtuals: true,
            versionKey: false,
        },
    }
);

ReviewSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

ReviewSchema.pre('save', function(next) {
    if (this.isNew) {
        this.createdAt = new Date(Date.now() - 1000);
        this.formatedDate = getFormatDateTime();
    }
    next();
});

const ReviewModel = mongoose.model<IReview>('Review', ReviewSchema);

export default ReviewModel;