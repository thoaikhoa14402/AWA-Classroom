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

class ClassroomController implements IController {
    path: string = "/classroom";
    router: Router = Router();
    
    constructor() {
        this.router.get('/list', catchAsync(this.getAll));
        this.router.delete('/:id', catchAsync(this.deleteById));
    }

    private getAll = async (req: Request, res: Response, next: NextFunction) => { 
        const classrooms = await ClassModel.find().select('cid name students owner slug').populate('owner');
        const classroomsResp = classrooms.map((classroom: IClass) => ({
            _id: classroom._id,
            cid: classroom.cid,
            name: classroom.name,
            numberOfStudents: classroom.students.length,
            owner: classroom.owner.username,
            slug: classroom.slug,
        }))
        return res.status(200).json({
            message: 'success',
            classrooms: classroomsResp
        })
    }

    private deleteById = async (req: Request, res: Response, next: NextFunction) => {
        await ClassModel.findByIdAndDelete(req.params.id);
        await JoinedClassInfoModel.deleteOne({class: req.params.id})
        const classrooms = await ClassModel.find().select('cid name students owner slug').populate('owner');
        const updatedCourses = classrooms.map((classroom: IClass) => ({
            _id: classroom._id,
            cid: classroom.cid,
            name: classroom.name,
            numberOfStudents: classroom.students.length,
            owner: classroom.owner.username,
            slug: classroom.slug,
        }))
        return res.status(200).json({
            message: 'success',
            updatedCourses: updatedCourses
        })
    }

   
}

export default new ClassroomController();