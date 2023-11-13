import { IsString, IsNotEmpty, MinLength, MaxLength, IsEmail} from "class-validator";
import { IUser } from "../models/user.model"
import { Match } from "../utils/match.decorator";

class RegisterUserDTO {
    @IsString({message: "Tên đăng nhập không hợp lệ"})
    @IsNotEmpty({message: "Tên đăng nhập không được bỏ trống"})
    public username!: string;

    @IsEmail({}, {message: "Email không hợp lệ"})
    @IsString({message: "Email không hợp lệ"})
    @IsNotEmpty({message: "Email không được bỏ trống"})
    public email!: string;

    @MinLength(8, {message: 'Mật khẩu phải ít nhất 8 kí tự'})
    @IsString({message: "Mật khẩu không hợp lệ"})
    @IsNotEmpty({message: "Mật khẩu không được bỏ trống"})
    public password!: string;

    @Match('password')
    @MinLength(8, {message: 'Xác nhận mật khẩu ít nhất 8 kí tự'})
    @IsString({message: "Xác nhận mật khẩu không hợp lệ"})
    @IsNotEmpty({message: "Xác nhận mật khẩu không được bỏ trống"})
    public passwordConfirm!: string;

    constructor(obj: IUser) {
		Object.assign(this, obj);
	}
}

export default RegisterUserDTO