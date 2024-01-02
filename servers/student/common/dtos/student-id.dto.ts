import { IsNotEmpty, IsString } from 'class-validator';

export class StudentIDDTO {
    @IsString({message: "Bad Request"})
    @IsNotEmpty({message: "Bad Request"})
    public studentID!: string;

    @IsString({message: "Bad Request"})
    @IsNotEmpty({message: "Bad Request"})
    public id!: string;
}

export default StudentIDDTO;