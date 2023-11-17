"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const catchAsync = (callback) => {
    return (req, res, next) => {
        callback(req, res, next).catch((err) => next(err));
    };
};
exports.default = catchAsync;
