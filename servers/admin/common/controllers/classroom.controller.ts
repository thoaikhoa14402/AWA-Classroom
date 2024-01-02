import { NextFunction, Request, Response, Router } from "express";
import { AuthController } from ".";
import IController from "../interfaces/controller";
import { IClass } from "../models/class.model"
import catchAsync from "../utils/catch.error";
import UserModel from "../models/user.model";
import ClassModel from "../models/class.model";
import JoinedClassInfoModel from "../models/joinedClassInfo.model"
import mongoose from "mongoose";
import { resolveSoa } from "dns";
import AppError from "../services/errors/app.error";

class ClassroomController implements IController {
    path: string = "/classroom";
    router: Router = Router();
    
    constructor() {
        // general
        this.router.get('/list', catchAsync(this.getAll));
        this.router.delete('/:id', catchAsync(this.deleteById));
        this.router.patch('/:id', catchAsync(this.updateActiveStatus));
        // detailed classroom
        this.router.get('/:slug', catchAsync(this.getDetailedClass));
        this.router.delete('/:slug/student/:id', catchAsync(this.deleteStudentFromClass));
        this.router.patch('/:slug/student/:id', catchAsync(this.mapNewStudentID))
    }

    private getAll = async (req: Request, res: Response, next: NextFunction) => { 
        const classrooms = await ClassModel.find().select('cid name students owner slug active').populate('owner');
        const classroomsResp = classrooms.map((classroom: IClass) => ({
            _id: classroom._id,
            cid: classroom.cid,
            name: classroom.name,
            numberOfStudents: classroom.students.length,
            owner: classroom.owner.username,
            slug: classroom.slug,
            active: classroom.active
        }))
        return res.status(200).json({
            message: 'success',
            classrooms: classroomsResp
        })
    }

    private deleteById = async (req: Request, res: Response, next: NextFunction) => {
        await ClassModel.findByIdAndDelete(req.params.id);
        await JoinedClassInfoModel.deleteOne({class: req.params.id})
        const classrooms = await ClassModel.find().select('cid name students owner slug active').populate('owner');
        const updatedCourses = classrooms.map((classroom: IClass) => ({
            _id: classroom._id,
            cid: classroom.cid,
            name: classroom.name,
            numberOfStudents: classroom.students.length,
            owner: classroom.owner.username,
            slug: classroom.slug,
            active: classroom.active
        }))
        return res.status(200).json({
            message: 'success',
            updatedCourses: updatedCourses
        })
    }

    private updateActiveStatus = async (req: Request, res: Response, next: NextFunction) => { 
        const foundedClassroom = await ClassModel.findById(req.params.id);
        if (foundedClassroom) {
            foundedClassroom.active = !(foundedClassroom.active)
        }
        await foundedClassroom?.save();

        return this.getAll(req, res, next);
    }

    private getDetailedClass = async (req: Request, res: Response, next: NextFunction) => {
        const classroom = await ClassModel.findOne({slug: req.params.slug}).select('_id cid name students lecturers owner slug').populate('students lecturers owner').lean()

        if (!classroom) {
            return next(new AppError('Class not found', 401));
        }
        let lecturers = [classroom?.owner, ...classroom?.lecturers]
        const students = [...classroom?.students.map((student) => student._id?.toString())]
        const joinedClassInfo = await JoinedClassInfoModel.find({class: classroom?._id, user: { $in: students }}).populate('user').lean()
        return res.status(200).json({
            message: 'success',
            cid: classroom.cid,
            name: classroom.name,
            detailedClassroom: [...joinedClassInfo.map(el => ({
                studentID: el.studentID,
                ...el.user,
            })), ...lecturers]
        })
    }

    private deleteStudentFromClass = async (req: Request, res: Response, next: NextFunction) => { 
        const updatedClassroom = await ClassModel.findOneAndUpdate({slug: req.params.slug},
            {$pull: { students: req.params.id}},
            {new: true}
        ).select('_id cid name students lecturers owner slug').populate('students lecturers owner').lean()

        if (!updatedClassroom) {
            return next(new AppError('Class not found', 401));
        }

        await JoinedClassInfoModel.deleteMany({
            class: updatedClassroom._id,
            user: req.params.id,
        })

        let lecturers = [updatedClassroom?.owner, ...updatedClassroom?.lecturers]
        const students = [...updatedClassroom?.students.map((student) => student._id?.toString())]
        const joinedClassInfo = await JoinedClassInfoModel.find({class: updatedClassroom?._id, user: { $in: students }}).populate('user').lean()
        return res.status(200).json({
            message: 'success',
            detailedClassroom: [...joinedClassInfo.map(el => ({
                studentID: el.studentID,
                ...el.user,
            })), ...lecturers]
        })
    }

    private mapNewStudentID = async (req: Request, res: Response, next: NextFunction) => { 
        const classroom = await ClassModel.findOne({slug: req.params.slug}).select('_id cid name students lecturers owner slug').populate('students lecturers owner').lean()
        if (!classroom) {
            return next(new AppError('Class not found', 401));
        }
        await JoinedClassInfoModel.findOneAndUpdate({
            class: classroom._id,
            user: req.params.id,
        }, {
            studentID: req.body.student_id,
        })
        let lecturers = [classroom?.owner, ...classroom?.lecturers]
        const students = [...classroom?.students.map((student) => student._id?.toString())]
        const joinedClassInfo = await JoinedClassInfoModel.find({class: classroom?._id, user: { $in: students }}).populate('user').lean()
        return res.status(200).json({
            message: 'success',
            detailedClassroom: [...joinedClassInfo.map(el => ({
                studentID: el.studentID,
                ...el.user,
            })), ...lecturers]
        })
    }
}

export default new ClassroomController();