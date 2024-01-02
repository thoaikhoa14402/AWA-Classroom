"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const JoinedClassInfoSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'User',
        required: [true, 'User required']
    },
    class: {
        type: mongoose_1.default.Types.ObjectId,
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
}, {
    toJSON: {
        virtuals: true,
        versionKey: false,
    },
    toObject: {
        virtuals: true,
        versionKey: false,
    },
});
JoinedClassInfoSchema.virtual('id').get(function () {
    return this._id.toHexString();
});
JoinedClassInfoSchema.pre('save', function (next) {
    if (this.isNew) {
        this.joinedAt = new Date(Date.now() - 1000);
    }
    next();
});
const JoinedClassInfoModel = mongoose_1.default.model('JoinedClassInfo', JoinedClassInfoSchema);
exports.default = JoinedClassInfoModel;
