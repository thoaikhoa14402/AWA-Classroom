import {
    IsString,
    IsNotEmpty,
    MinLength,
    NotEquals,
    IsEmail
} from "class-validator";
import { IUser } from "../models/user.model";
import { Match } from "../utils/match.decorator";
import IsNotEqualTo from "../utils/validators/isNotEqual";

class RenewPasswordDTO {
    @IsString({message: "Username is not valid"})
    @IsNotEmpty({message: "Username must not be empty"})
    public username!: string;

    @IsEmail({}, {message: "Email is not valid"})
    @IsString({message: "Email is not valid"})
    @IsNotEmpty({message: "Email must not be empty"})
    public email!: string;

    @MinLength(8, { message: "Password must be at least 8 characters" })
    @IsString({ message: "Password is not correct" })
    @IsNotEmpty({ message: "Password is not correct" })
    public newPassword!: string;

    @Match("newPassword", { message: "The password does not match" })
    @MinLength(8, { message: "Password must be at least 8 characters" })
    @IsString({ message: "The password does not match" })
    @IsNotEmpty({ message: "The password must not be empty" })
    public passwordConfirm!: string;

    constructor(obj: IUser) {
        Object.assign(this, obj);
    }
}

export default RenewPasswordDTO;
