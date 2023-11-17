"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
const phone_1 = require("../utils/validators/phone");
class UpdateProfileDTO {
    constructor(obj) {
        Object.assign(this, obj);
    }
}
__decorate([
    (0, class_validator_1.IsString)({ message: "Tên phải là chuỗi" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Tên không được bỏ trống" }),
    __metadata("design:type", String)
], UpdateProfileDTO.prototype, "firstname", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: "Họ và tên đệm không được bỏ trống" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Họ và tên đệm không được bỏ trống" }),
    __metadata("design:type", String)
], UpdateProfileDTO.prototype, "lastname", void 0);
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: "Email không hợp lệ" }),
    (0, class_validator_1.IsString)({ message: "Email không hợp lệ" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Email không được bỏ trống" }),
    __metadata("design:type", String)
], UpdateProfileDTO.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: "Số điện thoại không tồn tại" }),
    (0, class_validator_1.IsOptional)(),
    (0, phone_1.IsPhoneNumber)({ message: "Số điện thoại không tồn tại" }),
    __metadata("design:type", String)
], UpdateProfileDTO.prototype, "phoneNumber", void 0);
exports.default = UpdateProfileDTO;
