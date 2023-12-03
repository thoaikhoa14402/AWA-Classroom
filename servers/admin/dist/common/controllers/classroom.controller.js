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
const class_model_1 = __importDefault(require("../models/class.model"));
const joinedClassInfo_model_1 = __importDefault(require("../models/joinedClassInfo.model"));
class ClassroomController {
    constructor() {
        this.path = "/classroom";
        this.router = (0, express_1.Router)();
        this.getAll = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const classrooms = yield class_model_1.default.find().select('cid name students owner slug').populate('owner');
            const classroomsResp = classrooms.map((classroom) => ({
                _id: classroom._id,
                cid: classroom.cid,
                name: classroom.name,
                numberOfStudents: classroom.students.length,
                owner: classroom.owner.username,
                slug: classroom.slug,
            }));
            return res.status(200).json({
                message: 'success',
                classrooms: classroomsResp
            });
        });
        this.deleteById = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            yield class_model_1.default.findByIdAndDelete(req.params.id);
            yield joinedClassInfo_model_1.default.deleteOne({ class: req.params.id });
            const classrooms = yield class_model_1.default.find().select('cid name students owner slug').populate('owner');
            const updatedCourses = classrooms.map((classroom) => ({
                _id: classroom._id,
                cid: classroom.cid,
                name: classroom.name,
                numberOfStudents: classroom.students.length,
                owner: classroom.owner.username,
                slug: classroom.slug,
            }));
            return res.status(200).json({
                message: 'success',
                updatedCourses: updatedCourses
            });
        });
        this.router.get('/list', (0, catch_error_1.default)(this.getAll));
        this.router.delete('/:id', (0, catch_error_1.default)(this.deleteById));
    }
}
exports.default = new ClassroomController();
