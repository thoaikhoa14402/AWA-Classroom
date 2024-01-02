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
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const UserSchema = new mongoose_1.default.Schema({
    avatar: { type: String, default: 'https://lh3.googleusercontent.com/a/default-user=s120-p' },
    phoneNumber: { type: String },
    username: { type: String },
    googleID: { type: String },
    facebookID: { type: String },
    githubID: { type: String },
    firstname: { type: String },
    lastname: { type: String },
    role: { type: String, default: 'lecturer' },
    address: { type: String },
    password: {
        type: String,
        select: false, // never show up password field in the output if select == false
    },
    email: { type: String },
    active: {
        type: Boolean,
        default: true
    },
    verify: {
        type: Boolean,
        default: false
    },
    passwordChangedAt: { type: Number },
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
UserSchema.virtual('id').get(function () {
    return this._id.toHexString();
});
UserSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified('password') || !this.password)
            return next();
        const salt = yield bcryptjs_1.default.genSalt(process.env.SALT_ROUNDS || 12);
        this.password = yield bcryptjs_1.default.hash(this.password, salt);
        next();
    });
});
UserSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew)
        return next();
    this.passwordChangedAt = Date.now() - 1000;
    next();
});
UserSchema.methods.correctPassword = function (candidatePassword, userPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcryptjs_1.default.compare(candidatePassword, userPassword);
    });
};
const UserModel = mongoose_1.default.model('User', UserSchema);
exports.default = UserModel;
