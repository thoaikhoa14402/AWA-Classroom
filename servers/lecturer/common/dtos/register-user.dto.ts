import { IsString, IsNotEmpty, MinLength, MaxLength, IsEmail} from "class-validator";
import { IUser } from "../models/user.model"
import { Match } from "../utils/match.decorator";

class RegisterUserDTO {
    @IsString({message: "Username is not valid."})
    @IsNotEmpty({message: "Username must not be empty."})
    public username!: string;

    @IsEmail({}, {message: "Email is not valid."})
    @IsString({message: "Email is not valid."})
    @IsNotEmpty({message: "Email must not be empty."})
    public email!: string;

    @MinLength(8, {message: 'Password must be at least 8 characters.'})
    @IsString({message: "Password is not valid."})
    @IsNotEmpty({message: "Password is not valid."})
    public password!: string;

    @Match('password')
    @MinLength(8, {message: 'Password confirm must be at least 8 characters.'})
    @IsString({message: "Password confirm is not valid."})
    @IsNotEmpty({message: "Password confirm must not be empty."})
    public passwordConfirm!: string;

    constructor(obj: IUser) {
		Object.assign(this, obj);
	}
}

export default RegisterUserDTO