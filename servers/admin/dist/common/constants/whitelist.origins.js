"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const allowedOrigins = [
    process.env.CLIENT_HOST,
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:5500',
    'http://localhost:3000',
    'http://localhost:3001',
];
exports.default = allowedOrigins;
