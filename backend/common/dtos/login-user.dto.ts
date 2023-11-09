import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { IUser } from "@common/models/user.model"

export class LoginUserDTO {
    @IsNotEmpty({message: "Tài khoản không hợp lệ"})
    @IsString({message: "Tài khoản không hợp lệ"})
    public username!: string;

    @IsNotEmpty({message: "Tài khoản không hợp lệ"})
    @IsString({message: "Tài khoản không hợp lệ"})
    @MinLength(8, {message: 'Mật khẩu phải tối thiểu 8 kí tự'})
    public password!: string;

    constructor(obj: IUser) {
        Object.assign(this, obj);
    }
}

export default LoginUserDTO;