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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const mongoose_1 = __importDefault(require("mongoose"));
const user_model_1 = __importDefault(require("../../common/models/user.model"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: './.env' });
mongoose_1.default
    .connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to database successfully'));
// READ JSON FILE
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
// convert object_id ("$oid") in sample-data (users.json) to mongoose.Types.ObjectId
const modifiedUsers = users.map((user) => (Object.assign(Object.assign({}, user), { _id: new mongoose_1.default.Types.ObjectId(user._id.$oid) })));
// IMPORT DATA INTO DB
const importData = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield user_model_1.default.create(modifiedUsers);
        console.log('Loaded data successfully!');
    }
    catch (err) {
        console.log(err);
    }
    process.exit();
});
// DELETE ALL DATA FROM DB
const deleteData = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield user_model_1.default.deleteMany();
        console.log('Deleted data successfully!');
    }
    catch (err) {
        console.log(err);
    }
    process.exit();
});
if (process.argv[2] === '--import') {
    importData();
}
else if (process.argv[2] === '--delete') {
    deleteData();
}
