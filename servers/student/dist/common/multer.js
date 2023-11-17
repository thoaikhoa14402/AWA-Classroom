"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const parser_1 = __importDefault(require("datauri/parser"));
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = __importDefault(require("./cloudinary"));
class MulterCloudinaryUploader {
    constructor(allowedFileTypes, maxFileSize) {
        this.allowedFileTypes = allowedFileTypes !== null && allowedFileTypes !== void 0 ? allowedFileTypes : ['jpg', 'jpeg', 'png', 'gif'];
        this.maxFileSize = maxFileSize !== null && maxFileSize !== void 0 ? maxFileSize : 5 * 1024 * 1024; // 5 MB
        const storage = multer_1.default.memoryStorage();
        this.upload = (0, multer_1.default)({
            storage: storage,
            fileFilter: this.fileFilter.bind(this),
            limits: { fileSize: this.maxFileSize },
        });
    }
    single(fieldName) {
        return this.upload.single(fieldName);
    }
    uploadCloud(folder = 'images') {
        return (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const fileStream = this.dataUri(req);
            if (req.file && fileStream) {
                const file = fileStream.content;
                return cloudinary_1.default
                    .upload(file, {
                    folder: folder,
                    resource_type: 'auto',
                })
                    .then((result) => {
                    req.cloudinaryResult = result;
                    next();
                })
                    .catch((err) => next(err));
            }
            next();
        });
    }
    dataUri(req) {
        const dUri = new parser_1.default();
        return req.file ? dUri.format(path_1.default.extname(req.file.originalname).toString(), req.file.buffer) : null;
    }
    fileFilter(req, file, callback) {
        const extname = file.originalname.toLowerCase().split('.').pop();
        if (this.allowedFileTypes.includes(extname)) {
            return callback(null, true);
        }
        return callback(new Error('Invalid file type'));
    }
}
exports.default = MulterCloudinaryUploader;
