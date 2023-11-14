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
const match_decorator_1 = require("../utils/match.decorator");
class RegisterUserDTO {
    constructor(obj) {
        Object.assign(this, obj);
    }
}
__decorate([
    (0, class_validator_1.IsString)({ message: "Tên đăng nhập không hợp lệ" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Tên đăng nhập không được bỏ trống" }),
    __metadata("design:type", String)
], RegisterUserDTO.prototype, "username", void 0);
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: "Email không hợp lệ" }),
    (0, class_validator_1.IsString)({ message: "Email không hợp lệ" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Email không được bỏ trống" }),
    __metadata("design:type", String)
], RegisterUserDTO.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.MinLength)(8, { message: 'Mật khẩu phải ít nhất 8 kí tự' }),
    (0, class_validator_1.IsString)({ message: "Mật khẩu không hợp lệ" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Mật khẩu không được bỏ trống" }),
    __metadata("design:type", String)
], RegisterUserDTO.prototype, "password", void 0);
__decorate([
    (0, match_decorator_1.Match)('password'),
    (0, class_validator_1.MinLength)(8, { message: 'Xác nhận mật khẩu ít nhất 8 kí tự' }),
    (0, class_validator_1.IsString)({ message: "Xác nhận mật khẩu không hợp lệ" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Xác nhận mật khẩu không được bỏ trống" }),
    __metadata("design:type", String)
], RegisterUserDTO.prototype, "passwordConfirm", void 0);
exports.default = RegisterUserDTO;
