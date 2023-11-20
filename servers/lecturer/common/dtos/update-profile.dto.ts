import { IsString, IsNotEmpty, IsEmail, IsOptional } from "class-validator";
import { IsPhoneNumber } from "../utils/validators/phone";
import { IUser } from "../models/user.model";

class UpdateProfileDTO {	
	@IsString({ message: "First-name must be a string." })
    @IsNotEmpty({ message: "First-name must not be empty." })
    public firstname!: string;

    @IsString({message: "Last-name must be a string."})
    @IsNotEmpty({message: "Last-name must not be empty."})
    public lastname!: string;

    @IsEmail({}, {message: "Email is not valid."})
    @IsString({message: "Email is not valid."})
    @IsNotEmpty({message: "Email must not be empty."})
    public email!: string;

	@IsString({ message: "Phone number is not valid." })
    @IsOptional()
    @IsPhoneNumber({ message: "Phone number is not valid." })
    public phoneNumber?: string;

	constructor(obj: IUser) {
		Object.assign(this, obj);
	}
}

export default UpdateProfileDTO;