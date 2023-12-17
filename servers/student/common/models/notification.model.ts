import { IClass } from './class.model';
import mongoose from 'mongoose';
import { IUser } from './user.model';

export interface INotification {
    _id?: mongoose.Types.ObjectId;
    id: string;
    user: IUser;
    class: IClass;
    message: string;
    navigation: string;
    receiver: IUser[];
    createdAt: Date;
    formatedDate: string;
    readable: boolean;
}

const NotificationSchema = new mongoose.Schema<INotification>(
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
        message: {
            type: String,
        },
        navigation: {
            type: String,
        },
        receiver: {
            type: [mongoose.Types.ObjectId],
            ref: 'User',
        },
        createdAt: {
            type: Date,
            default: Date.now()
        },
        formatedDate: {
            type: String,
        },
        readable: {
            type: Boolean,
            default: false
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

NotificationSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

NotificationSchema.pre('save', function(next) {
    if (this.isNew) {
        this.createdAt = new Date(Date.now() - 1000);
    }
    next();
});

const NotificationModel = mongoose.model<INotification>('Notification', NotificationSchema);

export default NotificationModel;