import mongoose, { StringExpressionOperatorReturningBoolean } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser {
    _id: mongoose.Types.ObjectId;
    id?: string;
    avatar?: string;
    passwordChangedAt?: Number;
    lastname: string;
    firstname: string;
    username: string;
    password: string;
    email: string;
    phoneNumber: string;
}

const UserSchema = new mongoose.Schema<IUser>(
    {
        avatar: { type: String },
        phoneNumber: {type: String},
        username: { type: String, required: true},
        firstname: { type: String },
        lastname: { type: String},
        password: { 
            type: String,
            required: true,  
            select: false, // never show up password field in the output if select == false
        },
        email: { type: String, required: true },
        passwordChangedAt: { type: Number },
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

UserSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

UserSchema.pre('save', async function (next): Promise<void> {
    if (!this.isModified('password')) return next();
	const salt = await bcrypt.genSalt((process.env.SALT_ROUNDS as unknown as number) || 12);
	this.password = await bcrypt.hash(this.password, salt);
	next();
});

UserSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();
    this.passwordChangedAt = Date.now() - 1000;
    next();
});


const UserModel = mongoose.model<IUser>('User', UserSchema);

export default UserModel;