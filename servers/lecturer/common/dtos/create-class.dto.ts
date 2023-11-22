import { IsNotEmpty, IsString } from 'class-validator';
import { IUser } from "../models/user.model"

export class CreateClassDTO {
    @IsString({message: "Class must have a ID"})
    @IsNotEmpty({message: "Class must have a ID"})
    public cid!: string;

    @IsString({message: "Class must have a name"})
    @IsNotEmpty({message: "Class must have a name"})
    public name!: string;

    constructor(obj: IUser) {
        Object.assign(this, obj);
    }
}

export default CreateClassDTO;