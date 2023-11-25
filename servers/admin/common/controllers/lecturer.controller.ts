import { NextFunction, Request, Response, Router } from "express";
import { AuthController } from ".";
import IController from "../interfaces/controller";
import catchAsync from "../utils/catch.error";
import UserModel from "../models/user.model";
import mongoose from "mongoose";

class LecturerController implements IController {
    path: string = "/lecturer";
    router: Router = Router();
    
    constructor() {
        this.router.get('/list', catchAsync(this.getAll));
        this.router.delete('/:id', catchAsync(this.deleteById));
        this.router.patch('/:id', catchAsync(this.updateActiveStatus))
    }

    private getAll = async (req: Request, res: Response, next: NextFunction) => { 
        const lecturers = await UserModel.find({role: 'lecturer'});
        return res.status(200).json({
            message: 'success',
            lecturers: lecturers
        })
    }

    private deleteById = async (req: Request, res: Response, next: NextFunction) => {
        const deletedLecturer = await UserModel.findByIdAndDelete(req.params.id);
        const updatedLecturers = await UserModel.find({role: 'lecturer'});
        return res.status(200).json({
            message: 'success',
            updatedLecturers: updatedLecturers,
        })
    }

    private updateActiveStatus = async (req: Request, res: Response, next: NextFunction) => { 
        const foundedLecturer = await UserModel.findById(req.params.id);
        if (foundedLecturer) {
            foundedLecturer.active = !(foundedLecturer.active)
        }
        await foundedLecturer?.save();
        const updatedLecturers = await UserModel.find({role: 'lecturer'});
        return res.status(200).json({
            message: 'success',
            updatedLecturers: updatedLecturers
        })
    }
}

export default new LecturerController();