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
class StudentController {
    constructor() {
        this.path = "/student";
        this.router = (0, express_1.Router)();
        this.getAll = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const students = yield user_model_1.default.find({ role: 'student' });
            return res.status(200).json({
                message: 'success',
                students: students
            });
        });
        this.deleteById = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const deletedStudent = yield user_model_1.default.findByIdAndDelete(req.params.id);
            const updatedStudents = yield user_model_1.default.find({ role: 'student' });
            return res.status(200).json({
                message: 'success',
                updatedStudents: updatedStudents
            });
        });
        this.updateActiveStatus = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const foundedStudent = yield user_model_1.default.findById(req.params.id);
            if (foundedStudent) {
                foundedStudent.active = !(foundedStudent.active);
            }
            yield (foundedStudent === null || foundedStudent === void 0 ? void 0 : foundedStudent.save());
            const updatedStudents = yield user_model_1.default.find({ role: 'student' });
            return res.status(200).json({
                message: 'success',
                updatedStudents: updatedStudents
            });
        });
        this.router.get('/list', (0, catch_error_1.default)(this.getAll));
        this.router.delete('/:id', (0, catch_error_1.default)(this.deleteById));
        this.router.patch('/:id', (0, catch_error_1.default)(this.updateActiveStatus));
    }
}
exports.default = new StudentController();
