import {
    IsString,
    IsNotEmpty,
    MinLength,
    NotEquals,
} from "class-validator";
import { IUser } from "../models/user.model";
import { Match } from "../utils/match.decorator";
import IsNotEqualTo from "../utils/validators/isNotEqual";

class ResetPasswordDTO {
    @MinLength(8, { message: "Password is not correct" })
    @IsString({ message: "Password is not correct" })
    @IsNotEmpty({ message: "Password is not correct" })
    public currentPassword!: string;

    @MinLength(8, { message: "Password must be at least 8 characters" })
    @IsString({ message: "Password is invalid" })
    @IsNotEmpty({ message: "Password is invalid" })
    @IsNotEqualTo("currentPassword", { message: "The new password must be different from the current password" })
    public newPassword!: string;

    @Match("newPassword", { message: "The password does not match" })
    @MinLength(8, { message: "The password does not match" })
    @IsString({ message: "The password does not match" })
    @IsNotEmpty({ message: "The password does not match" })
    public confirmPassword!: string;

    constructor(obj: IUser) {
        Object.assign(this, obj);
    }
}

export default ResetPasswordDTO;
