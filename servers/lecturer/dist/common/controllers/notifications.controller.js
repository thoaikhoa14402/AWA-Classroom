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
const express_1 = require("express");
const catch_error_1 = __importDefault(require("../utils/catch.error"));
const _1 = require(".");
const notification_model_1 = __importDefault(require("../models/notification.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const class_model_1 = __importDefault(require("../models/class.model"));
/*
 NOTIFICATION CONTROLLER
1. GET ALL NOTIFICATIONS
*/
class NotificationController {
    constructor() {
        this.path = "/notifications";
        this.router = (0, express_1.Router)();
        this.getAllNotifications = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const classes = yield class_model_1.default.find({ $or: [
                    { lecturers: new mongoose_1.default.Types.ObjectId((_a = req.user) === null || _a === void 0 ? void 0 : _a._id) },
                    { owner: new mongoose_1.default.Types.ObjectId((_b = req.user) === null || _b === void 0 ? void 0 : _b._id) },
                ] }).lean();
            const classIds = classes.map((item) => item._id);
            const notification = yield notification_model_1.default.find({
                class: { $in: classIds },
                receiver: new mongoose_1.default.Types.ObjectId((_c = req.user) === null || _c === void 0 ? void 0 : _c._id),
            }).populate('user class').sort({
                createdAt: -1
            }).lean();
            res.status(200).json({
                status: 'success',
                data: notification
            });
        });
        this.router.get('/', _1.AuthController.protect, (0, catch_error_1.default)(this.getAllNotifications));
    }
}
exports.default = new NotificationController();
