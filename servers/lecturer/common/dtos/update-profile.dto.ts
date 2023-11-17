import { IsString, IsNotEmpty, IsEmail, IsOptional } from "class-validator";
import { IsPhoneNumber } from "../utils/validators/phone";
import { IUser } from "../models/user.model";

class UpdateProfileDTO {	
	@IsString({ message: "Tên phải là chuỗi" })
    @IsNotEmpty({ message: "Tên không được bỏ trống" })
    public firstname!: string;

    @IsString({message: "Họ và tên đệm không được bỏ trống"})
    @IsNotEmpty({message: "Họ và tên đệm không được bỏ trống"})
    public lastname!: string;

    @IsEmail({}, {message: "Email không hợp lệ"})
    @IsString({message: "Email không hợp lệ"})
    @IsNotEmpty({message: "Email không được bỏ trống"})
    public email!: string;

	@IsString({ message: "Số điện thoại không tồn tại" })
    @IsOptional()
    @IsPhoneNumber({ message: "Số điện thoại không tồn tại" })
    public phoneNumber?: string;

	constructor(obj: IUser) {
		Object.assign(this, obj);
	}
}

export default UpdateProfileDTO;