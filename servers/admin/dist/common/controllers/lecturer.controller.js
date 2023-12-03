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
const user_model_1 = __importDefault(require("../models/user.model"));
class LecturerController {
    constructor() {
        this.path = "/lecturer";
        this.router = (0, express_1.Router)();
        this.getAll = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const lecturers = yield user_model_1.default.find({ role: 'lecturer' });
            return res.status(200).json({
                message: 'success',
                lecturers: lecturers
            });
        });
        this.deleteById = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const deletedLecturer = yield user_model_1.default.findByIdAndDelete(req.params.id);
            const updatedLecturers = yield user_model_1.default.find({ role: 'lecturer' });
            return res.status(200).json({
                message: 'success',
                updatedLecturers: updatedLecturers,
            });
        });
        this.updateActiveStatus = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const foundedLecturer = yield user_model_1.default.findById(req.params.id);
            if (foundedLecturer) {
                foundedLecturer.active = !(foundedLecturer.active);
            }
            yield (foundedLecturer === null || foundedLecturer === void 0 ? void 0 : foundedLecturer.save());
            const updatedLecturers = yield user_model_1.default.find({ role: 'lecturer' });
            return res.status(200).json({
                message: 'success',
                updatedLecturers: updatedLecturers
            });
        });
        this.router.get('/list', (0, catch_error_1.default)(this.getAll));
        this.router.delete('/:id', (0, catch_error_1.default)(this.deleteById));
        this.router.patch('/:id', (0, catch_error_1.default)(this.updateActiveStatus));
    }
}
exports.default = new LecturerController();
