import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { IStudentList } from '../models/class.model';

export class StudentListDTO {
    @IsString({message: "Class ID must be a string"})
    @IsNotEmpty({message: "Class ID not founded!"})
    public classID!: string;

    @IsArray({message: "Student list must have a studentID, fullname and email"})
    public studentList!: Array<IStudentList>;
}

export default StudentListDTO;