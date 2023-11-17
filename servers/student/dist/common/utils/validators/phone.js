"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsPhoneNumber = void 0;
const class_validator_1 = require("class-validator");
let IsPhoneNumberConstraint = class IsPhoneNumberConstraint {
    validate(value, args) {
        return (value) ? /(03|05|07|08|09|01[2|6|8|9])+(\d{8})\b/.test(value) : true;
    }
    defaultMessage(args) {
        return "Invalid phone number";
    }
};
IsPhoneNumberConstraint = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: "isPhoneNumber", async: false })
], IsPhoneNumberConstraint);
function IsPhoneNumber(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: "isPhoneNumber",
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsPhoneNumberConstraint,
        });
    };
}
exports.IsPhoneNumber = IsPhoneNumber;
