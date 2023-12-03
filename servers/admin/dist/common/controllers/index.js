"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassroomController = exports.LecturerController = exports.StudentController = exports.UserProfile = exports.AuthController = void 0;
// export { default as UserController } from "./user.example.controller";
var auth_controller_1 = require("./auth.controller");
Object.defineProperty(exports, "AuthController", { enumerable: true, get: function () { return __importDefault(auth_controller_1).default; } });
var user_controller_1 = require("./user.controller");
Object.defineProperty(exports, "UserProfile", { enumerable: true, get: function () { return __importDefault(user_controller_1).default; } });
var student_controller_1 = require("./student.controller");
Object.defineProperty(exports, "StudentController", { enumerable: true, get: function () { return __importDefault(student_controller_1).default; } });
var lecturer_controller_1 = require("./lecturer.controller");
Object.defineProperty(exports, "LecturerController", { enumerable: true, get: function () { return __importDefault(lecturer_controller_1).default; } });
var classroom_controller_1 = require("./classroom.controller");
Object.defineProperty(exports, "ClassroomController", { enumerable: true, get: function () { return __importDefault(classroom_controller_1).default; } });
