import { IClass } from './class.model';
import mongoose from 'mongoose';
import { IUser } from './user.model';

export interface IJoinedClassInfo {
    _id?: mongoose.Types.ObjectId;
    id: string;
    user: IUser;
    class: IClass;
    studentID: string;
    joinedAt: Date;
}

const JoinedClassInfoSchema = new mongoose.Schema<IJoinedClassInfo>(
    {
        user: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
            required: [true, 'User required']
        },
        class: {
            type: mongoose.Types.ObjectId,
            ref: 'Class',
            required: [true, 'Class required']
        },
        studentID: {
            type: String,
        },
        joinedAt: {
            type: Date,
            default: Date.now()
        },
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

JoinedClassInfoSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

JoinedClassInfoSchema.pre('save', function(next) {
    if (this.isNew) {
        this.joinedAt = new Date(Date.now() - 1000);
    }
    next();
});

const JoinedClassInfoModel = mongoose.model<IJoinedClassInfo>('JoinedClassInfo', JoinedClassInfoSchema);

export default JoinedClassInfoModel;