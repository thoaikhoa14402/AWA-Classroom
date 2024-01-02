import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ReviewDTO {
    @IsString({message: "Bad Request"})
    @IsNotEmpty({message: "Bad Request"})
    public classID!: string;

    @IsString({message: "Bad Request"})
    @IsNotEmpty({message: "Bad Request"})
    public reason!: string;

    @IsNumber({}, {message: "Bad Request"})
    @IsNotEmpty({message: "Bad Request"})
    public expected!: number;

    @IsNumber({}, {message: "Bad Request"})
    @IsNotEmpty({message: "Bad Request"})
    public grade!: number;

    @IsString({message: "Bad Request"})
    @IsNotEmpty({message: "Bad Request"})
    public composition!: string;
}

export default ReviewDTO;