import { IsString, IsNotEmpty, MinLength, MaxLength, IsEmail} from "class-validator";
import { IUser } from "@common/models/user.model"
import { Match } from "../utils/match.decorator";

class RegisterUserDTO {
    @IsNotEmpty({message: "Username is required"})
    @IsString({message: "Username must be a string"})
    public username!: string;

    @IsNotEmpty({message: "Email is required"})
    @IsString({message: "Email must be a string"})
    @IsEmail({}, {message: "Email is not valid"})
    public email!: string;

    @IsNotEmpty({message: "Password is required"})
    @IsString({message: "Password must be a string"})
    @MinLength(8, {message: 'Password must be at least 8 characters'})
    public password!: string;

    @IsNotEmpty({message: "Password confirm is required"})
    @IsString({message: "Password confirm must be a string"})
    @MinLength(8, {message: 'Password confirm must be at least 8 characters'})
    @Match('password')
    public passwordConfirm!: string;
}

export default RegisterUserDTO