import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { IUser } from "../models/user.model"

export class LoginUserDTO {
    @IsString({message: "Tài khoản không hợp lệ"})
    @IsNotEmpty({message: "Tài khoản không hợp lệ"})
    public username!: string;

    @MinLength(8, {message: 'Mật khẩu phải tối thiểu 8 kí tự'})
    @IsString({message: "Mật khẩu không hợp lệ"})
    @IsNotEmpty({message: "Mật khẩu không hợp lệ"})
    public password!: string;

    constructor(obj: IUser) {
        Object.assign(this, obj);
    }
}

export default LoginUserDTO;