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
exports.InviteClassDTO = void 0;
const class_validator_1 = require("class-validator");
class InviteClassDTO {
}
exports.InviteClassDTO = InviteClassDTO;
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: "Invalid emails", each: true }),
    (0, class_validator_1.IsArray)({ message: "Invalid emails" }),
    __metadata("design:type", Array)
], InviteClassDTO.prototype, "emails", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: "Bad Request" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Bad Request" }),
    __metadata("design:type", String)
], InviteClassDTO.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: "Bad Request" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Bad Request" }),
    __metadata("design:type", String)
], InviteClassDTO.prototype, "inviteLink", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: "Bad Request" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Bad Request" }),
    __metadata("design:type", String)
], InviteClassDTO.prototype, "role", void 0);
exports.default = InviteClassDTO;
