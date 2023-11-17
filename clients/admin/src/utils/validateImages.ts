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
        return 'Ảnh không hợp lệ. Chỉ chấp nhận định dạng "jpeg" hoặc "png".';

    if (image.size > size) 
        return `Ảnh phải nhỏ hơn ${size / 1024 / 1024}MB`;

    return false;
};

export default validate;