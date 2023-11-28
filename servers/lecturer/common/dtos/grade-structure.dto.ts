import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { IGradeColumn } from '../models/class.model';

export class GradeStructureDTO {
    @IsString({message: "Class ID must be a string"})
    @IsNotEmpty({message: "Class ID not founded!"})
    public classID!: string;

    @IsArray({message: "Grade structure must have a grade compositions"})
    public gradeCompositions!: Array<IGradeColumn>;
}

export default GradeStructureDTO;