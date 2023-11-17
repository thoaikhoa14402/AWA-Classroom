"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./common/app"));
const allController = __importStar(require("./common/controllers"));
const allEvent = __importStar(require("./common/events"));
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception. Shutting down...');
    console.error(err.name, err.message, err.stack);
    setTimeout(() => {
        process.exit(1);
    }, 3000);
});
const app = new app_1.default({
    controllers: Object.values(allController),
    events: Object.values(allEvent),
    redisConnection: {
        uri: process.env.REDIS_URI,
    },
    mongoConnection: {
        uri: process.env.MONGO_URI,
    },
    cloudinaryConnection: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    },
});
const server = app.run();
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection. Shutting down...');
    console.error(err.name, err.message, err.stack);
    setTimeout(() => {
        server.close(() => {
            process.exit(1);
        });
    }, 3000);
});
