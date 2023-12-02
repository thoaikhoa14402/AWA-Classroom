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
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary_1 = require("cloudinary");
class Cloudinary {
    constructor() {
        this.upload = (file, options) => __awaiter(this, void 0, void 0, function* () {
            return yield cloudinary_1.v2.uploader.upload(file, options);
        });
        this.destroy = (publicId) => __awaiter(this, void 0, void 0, function* () {
            return yield cloudinary_1.v2.uploader.destroy(publicId);
        });
        this.delete = (publicIds) => __awaiter(this, void 0, void 0, function* () {
            return yield cloudinary_1.v2.api.delete_resources(publicIds, { type: 'upload', resource_type: 'raw' });
        });
        this.crop = (id, h, w) => {
            return cloudinary_1.v2.url(id, {
                height: h,
                width: w,
                crop: 'scale'
            });
        };
    }
    config(options) {
        return (req, res, next) => {
            cloudinary_1.v2.config(options);
            next();
        };
    }
}
const cloudinary = new Cloudinary();
exports.default = cloudinary;
