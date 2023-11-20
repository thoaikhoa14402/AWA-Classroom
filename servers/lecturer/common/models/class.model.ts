import mongoose from 'mongoose';
import { IUser } from './user.model';

export interface IClass {
    _id?: mongoose.Types.ObjectId;
    id: string;
    name: string;
    banner?: string;
    section?: string;
    createAt: Date;
    students: Array<IUser>,
    teachers: Array<IUser>,
    owner: IUser,
}

const ClassSchema = new mongoose.Schema<IClass>(
    {
        banner: String,
        name: {
            required: [true, 'Class must have a name'],
            type: String,
        },
        section: String,
        createAt: {
            type: Date,
            default: Date.now()
        },
        students: {
            type: [mongoose.Types.ObjectId],
            ref: 'User',
            default: []
        },
        teachers: {
            type: [mongoose.Types.ObjectId],
            ref: 'User',
            default: []
        },
        owner: {
            required: [true, 'Class must have an owner'],
            type: mongoose.Types.ObjectId,
            ref: 'User'
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

ClassSchema.virtual('id').get(function() {
    return this._id.toHexString();
});


const ClassModel = mongoose.model<IClass>('Class', ClassSchema);

export default ClassModel;