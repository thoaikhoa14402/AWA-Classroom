"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
function IsNotEqualTo(property, validationOptions) {
    return function (object, propertyName) {
        var _a;
        (0, class_validator_1.ValidateIf)((o) => o[property] !== o[propertyName], {
            message: (_a = validationOptions === null || validationOptions === void 0 ? void 0 : validationOptions.message) !== null && _a !== void 0 ? _a : `${propertyName} should not be equal to ${property}`,
        })(object, propertyName);
    };
}
exports.default = IsNotEqualTo;
