"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const NotificationSchema = new mongoose_1.default.Schema({
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
    message: {
        type: String,
    },
    navigation: {
        type: String,
    },
    receiver: {
        type: [mongoose_1.default.Types.ObjectId],
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
NotificationSchema.virtual('id').get(function () {
    return this._id.toHexString();
});
NotificationSchema.pre('save', function (next) {
    if (this.isNew) {
        this.createdAt = new Date(Date.now() - 1000);
    }
    next();
});
const NotificationModel = mongoose_1.default.model('Notification', NotificationSchema);
exports.default = NotificationModel;
