"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const joinedClassInfo_model_1 = __importDefault(require("./joinedClassInfo.model"));
const class_model_1 = __importDefault(require("./class.model"));
const date_format_1 = __importDefault(require("../utils/date.format"));
const user_model_1 = __importDefault(require("./user.model"));
const ReviewSchema = new mongoose_1.default.Schema({
    class: {
        type: mongoose_1.default.Types.ObjectId,
        ref: class_model_1.default,
    },
    joinedInfo: {
        type: mongoose_1.default.Types.ObjectId,
        ref: joinedClassInfo_model_1.default,
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
                    type: mongoose_1.default.Types.ObjectId,
                    ref: user_model_1.default,
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
ReviewSchema.virtual('id').get(function () {
    return this._id.toHexString();
});
ReviewSchema.pre('save', function (next) {
    if (this.isNew) {
        this.createdAt = new Date(Date.now() - 1000);
        this.formatedDate = (0, date_format_1.default)();
    }
    next();
});
const ReviewModel = mongoose_1.default.model('Review', ReviewSchema);
exports.default = ReviewModel;
