import { IsArray, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class InviteClassDTO {
    @IsEmail({}, {message: "Invalid emails", each: true})
    @IsArray({message: "Invalid emails"})
    public emails!: Array<string>;

    @IsString({message: "Bad Request"})
    @IsNotEmpty({message: "Bad Request"})
    public id!: string;

    @IsString({message: "Bad Request"})
    @IsNotEmpty({message: "Bad Request"})
    public inviteLink!: string;

    @IsString({message: "Bad Request"})
    @IsNotEmpty({message: "Bad Request"})
    public role!: string;
}

export default InviteClassDTO;