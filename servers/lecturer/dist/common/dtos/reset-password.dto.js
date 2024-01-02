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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
const match_decorator_1 = require("../utils/match.decorator");
const isNotEqual_1 = __importDefault(require("../utils/validators/isNotEqual"));
class ResetPasswordDTO {
    constructor(obj) {
        Object.assign(this, obj);
    }
}
__decorate([
    (0, class_validator_1.MinLength)(8, { message: "Password is not correct" }),
    (0, class_validator_1.IsString)({ message: "Password is not correct" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Password is not correct" }),
    __metadata("design:type", String)
], ResetPasswordDTO.prototype, "currentPassword", void 0);
__decorate([
    (0, class_validator_1.MinLength)(8, { message: "Password must be at least 8 characters" }),
    (0, class_validator_1.IsString)({ message: "Password is invalid" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Password is invalid" }),
    (0, isNotEqual_1.default)("currentPassword", { message: "The new password must be different from the current password" }),
    __metadata("design:type", String)
], ResetPasswordDTO.prototype, "newPassword", void 0);
__decorate([
    (0, match_decorator_1.Match)("newPassword", { message: "The password does not match" }),
    (0, class_validator_1.MinLength)(8, { message: "The password does not match" }),
    (0, class_validator_1.IsString)({ message: "The password does not match" }),
    (0, class_validator_1.IsNotEmpty)({ message: "The password does not match" }),
    __metadata("design:type", String)
], ResetPasswordDTO.prototype, "confirmPassword", void 0);
exports.default = ResetPasswordDTO;
