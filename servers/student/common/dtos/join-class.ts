import { IsNotEmpty, IsString } from 'class-validator';

export class JoinClassDTO {
    @IsString({message: "Bad Request"})
    @IsNotEmpty({message: "Bad Request"})
    public code!: string;

    @IsString({message: "Bad Request"})
    @IsNotEmpty({message: "Bad Request"})
    public classID!: string;
}

export class JoinWithCodeDTO {
    @IsString({message: "Bad Request"})
    @IsNotEmpty({message: "Bad Request"})
    public code!: string;
}

export default JoinClassDTO;