import { IsString, IsNotEmpty, MinLength, MaxLength, IsEmail} from "class-validator";
import { IUser } from "@common/models/user.model"
import { Match } from "../utils/match.decorator";

class RegisterUserDTO {
    @IsNotEmpty({message: "Tên đăng nhập không được bỏ trống"})
    @IsString({message: "Tên đăng nhập không hợp lệ"})
    public username!: string;

    @IsNotEmpty({message: "Email không được bỏ trống"})
    @IsString({message: "Email không hợp lệ"})
    @IsEmail({}, {message: "Email không hợp lệ"})
    public email!: string;

    @IsNotEmpty({message: "Mật khẩu không được bỏ trống"})
    @IsString({message: "Mật khẩu không hợp lệ"})
    @MinLength(8, {message: 'Mật khẩu phải ít nhất 8 kí tự'})
    public password!: string;

    @IsNotEmpty({message: "Xác nhận mật khẩu không được bỏ trống"})
    @IsString({message: "Xác nhận mật khẩu không hợp lệ"})
    @MinLength(8, {message: 'Xác nhận mật khẩu ít nhất 8 kí tự'})
    @Match('password')
    public passwordConfirm!: string;

    constructor(obj: IUser) {
		Object.assign(this, obj);
	}
}

export default RegisterUserDTO