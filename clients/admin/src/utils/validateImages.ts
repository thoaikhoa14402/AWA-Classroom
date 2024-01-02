import { RcFile } from "antd/es/upload";

interface ValidateOptions {
    whitelist: string[];
    size: number;
};

const validate = (image: RcFile, options: ValidateOptions = {
    whitelist: ['image/jpeg', 'image/png'],
    size: 2 * 1024 * 1024,
}): string | false => {

    const { whitelist, size } = options;

    if (!whitelist.includes(image.type))
        return 'Invalid image. Only accept the formats "jpeg" or "png".';

    if (image.size > size) 
        return `Image must be smaller than ${size / 1024 / 1024}MB`;

    return false;
};

export default validate;