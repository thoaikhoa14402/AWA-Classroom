import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IUser } from "../models/user.model"

export class CreateClassDTO {
    @IsString({message: "Class must have a name"})
    @IsNotEmpty({message: "Class must have a name"})
    public name!: string;

    @IsOptional()
    public section!: string;

    constructor(obj: IUser) {
        Object.assign(this, obj);
    }
}

export default CreateClassDTO;