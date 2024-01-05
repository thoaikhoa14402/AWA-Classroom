"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassPermissionType = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const joinedClassInfo_model_1 = __importDefault(require("./joinedClassInfo.model"));
const otp_generator_1 = __importDefault(require("../utils/otp-generator"));
var ClassPermissionType;
(function (ClassPermissionType) {
    ClassPermissionType["READ"] = "class_permission_read";
    ClassPermissionType["WRITE"] = "class_permission_write";
    ClassPermissionType["NONE"] = "class_permission_none";
})(ClassPermissionType || (exports.ClassPermissionType = ClassPermissionType = {}));
;
const ClassSchema = new mongoose_1.default.Schema({
    cid: String,
    name: {
        required: [true, 'Class must have a name'],
        type: String,
    },
    banner: {
        type: String,
        default: 'https://www.gstatic.com/classroom/themes/Honors.jpg'
    },
    createAt: {
        type: Date,
        default: Date.now()
    },
    students: {
        type: [mongoose_1.default.Types.ObjectId],
        ref: 'User',
        default: []
    },
    lecturers: {
        type: [mongoose_1.default.Types.ObjectId],
        ref: 'User',
        default: []
    },
    owner: {
        required: [true, 'Class must have an owner'],
        type: mongoose_1.default.Types.ObjectId,
        ref: 'User'
    },
    inviteCode: {
        type: String,
        default: new otp_generator_1.default({
            digits: false,
            specialChars: false,
            upperCaseAlphabets: true,
            lowerCaseAlphabets: false
        }, 7).generate()
    },
    slug: {
        type: String,
        default: new otp_generator_1.default({
            specialChars: false,
            digits: false,
        }, 15).generate()
    },
    active: {
        type: Boolean,
        default: true
    },
    studentPermission: {
        annoucement: {
            type: String,
            enum: Object.values(ClassPermissionType),
            default: ClassPermissionType.WRITE
        },
        assignment: {
            type: String,
            enum: Object.values(ClassPermissionType),
            default: ClassPermissionType.WRITE
        },
        review: {
            type: String,
            enum: Object.values(ClassPermissionType),
            default: ClassPermissionType.WRITE
        },
        comment: {
            type: String,
            enum: Object.values(ClassPermissionType),
            default: ClassPermissionType.WRITE
        }
    },
    lecturerPermission: {
        annoucement: {
            type: String,
            enum: Object.values(ClassPermissionType),
            default: ClassPermissionType.WRITE
        },
        assignment: {
            type: String,
            enum: Object.values(ClassPermissionType),
            default: ClassPermissionType.WRITE
        },
        review: {
            type: String,
            enum: Object.values(ClassPermissionType),
            default: ClassPermissionType.WRITE
        },
        comment: {
            type: String,
            enum: Object.values(ClassPermissionType),
            default: ClassPermissionType.WRITE
        }
    },
    ownerPermission: {
        annoucement: {
            type: String,
            enum: Object.values(ClassPermissionType),
            default: ClassPermissionType.WRITE
        },
        assignment: {
            type: String,
            enum: Object.values(ClassPermissionType),
            default: ClassPermissionType.WRITE
        },
        review: {
            type: String,
            enum: Object.values(ClassPermissionType),
            default: ClassPermissionType.WRITE
        },
        comment: {
            type: String,
            enum: Object.values(ClassPermissionType),
            default: ClassPermissionType.WRITE
        }
    },
    gradeColumns: {
        type: [{
                name: {
                    type: String,
                    required: [true, 'Grade column must have a name']
                },
                scale: {
                    type: Number,
                    required: [true, 'Grade column must have a scale']
                },
                order: {
                    type: Number,
                    default: 0
                },
                published: {
                    type: Boolean,
                    default: false
                }
            }],
        default: []
    },
    studentListUrl: {
        type: String,
    },
    studentList: {
        type: [{
                student_id: {
                    type: String,
                    ref: joinedClassInfo_model_1.default,
                    refID: 'studentID'
                },
                full_name: {
                    type: String
                },
                email: {
                    type: String
                },
            }],
        default: []
    },
    gradeList: {
        type: [{
                student_id: {
                    type: String,
                    ref: joinedClassInfo_model_1.default,
                },
                grade_name: [{
                        type: String,
                    }],
                grade: [{
                        col: {
                            type: String,
                        },
                        value: {
                            type: Number,
                        }
                    }],
            }],
        default: []
    },
    gradeListUrl: {
        type: String,
    }
}, {
    toJSON: {
        virtuals: true,
        versionKey: false,
    },
    toObject: {
        virtuals: true,
        versionKey: false,
    },
});
ClassSchema.virtual('id').get(function () {
    return this._id.toHexString();
});
ClassSchema.pre('save', function (next) {
    if (this.isNew) {
        this.inviteCode = new otp_generator_1.default({
            digits: false,
            specialChars: false,
            upperCaseAlphabets: true,
            lowerCaseAlphabets: false
        }, 7).generate();
        this.slug = new otp_generator_1.default({
            specialChars: false,
            digits: false,
        }, 15).generate();
    }
    next();
});
const ClassModel = mongoose_1.default.model('Class', ClassSchema);
exports.default = ClassModel;
