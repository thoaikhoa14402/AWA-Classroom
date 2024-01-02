import { NextFunction, Request, Response, Router } from "express";
import { AuthController } from ".";
import IController from "../interfaces/controller";
import catchAsync from "../utils/catch.error";
import UserModel, { IUser } from "../models/user.model";
import mongoose from "mongoose";

class StudentController implements IController {
    path: string = "/student";
    router: Router = Router();
    
    constructor() {
        this.router.get('/list', catchAsync(this.getAll));
        this.router.delete('/:id', catchAsync(this.deleteById));
        this.router.patch('/:id', catchAsync(this.updateActiveStatus))
    }

    private getAll = async (req: Request, res: Response, next: NextFunction) => { 
        let students = await UserModel.find({role: 'student'});
        return res.status(200).json({
            message: 'success',
            students: students
        })
    }

    private deleteById = async (req: Request, res: Response, next: NextFunction) => {
        const deletedStudent = await UserModel.findByIdAndDelete(req.params.id);
        const updatedStudents = await UserModel.find({role: 'student'});
        return res.status(200).json({
            message: 'success',
            updatedStudents: updatedStudents
        })
    }

    private updateActiveStatus = async (req: Request, res: Response, next: NextFunction) => { 
        const foundedStudent = await UserModel.findById(req.params.id);
        if (foundedStudent) {
            foundedStudent.active = !(foundedStudent.active)
        }
        await foundedStudent?.save();
        const updatedStudents = await UserModel.find({role: 'student'});
        return res.status(200).json({
            message: 'success',
            updatedStudents: updatedStudents
        })
    }
}

export default new StudentController();