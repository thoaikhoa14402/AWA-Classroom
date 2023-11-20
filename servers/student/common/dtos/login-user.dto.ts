import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { IUser } from "../models/user.model"

export class LoginUserDTO {
    @IsString({message: "Username is not valid."})
    @IsNotEmpty({message: "Username is not valid."})
    public username!: string;

    @MinLength(8, {message: 'Password must be at least 8 characters.'})
    @IsString({message: "Password is not valid."})
    @IsNotEmpty({message: "Password is not valid."})
    public password!: string;

    constructor(obj: IUser) {
        Object.assign(this, obj);
    }
}

export default LoginUserDTO;