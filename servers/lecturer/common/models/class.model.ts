import mongoose from 'mongoose';
import JoinedClassInfoModel from './joinedClassInfo.model';
import { IUser } from './user.model';
import OTPGenerator from "../utils/otp-generator";

export enum ClassPermissionType {
    READ = 'class_permission_read',
    WRITE = 'class_permission_write',
    NONE = 'class_permission_none'
}

export interface IClassPermission {
    annoucement: ClassPermissionType;
    assignment: ClassPermissionType;
    review: ClassPermissionType;
    comment: ClassPermissionType;
}

export interface IGradeColumn {
    name: string;
    scale: number;
    order: number;
    published: boolean;
};

export interface IStudentList {
    _id: mongoose.Types.ObjectId;
    student_id: string;
    full_name: string;
    email: string;
    user?: string;
    studentID?: string;
}

export interface IGradeList {
    _id: mongoose.Types.ObjectId;
    student_id: string;
    grade_name: string[];
    grade: {
        col: string;
        value: number;
    }[];
    user?: string;
    studentID?: string;
}

export interface IClass {
    _id?: mongoose.Types.ObjectId;
    id: string;
    cid?: string;
    name: string;
    banner?: string;
    createAt: Date;
    students: Array<IUser>;
    lecturers: Array<IUser>;
    owner: IUser;
    inviteCode: string;
    slug: string;
    active: boolean;
    studentPermission: IClassPermission;
    lecturerPermission: IClassPermission;
    ownerPermission: IClassPermission;
    gradeColumns: Array<IGradeColumn>;
    studentList: Array<IStudentList>;
    studentListUrl: string;
    gradeList: Array<IGradeList>;
    gradeListUrl: string;
}

const ClassSchema = new mongoose.Schema<IClass>(
    {
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
            type: [mongoose.Types.ObjectId],
            ref: 'User',
            default: []
        },
        lecturers: {
            type: [mongoose.Types.ObjectId],
            ref: 'User',
            default: []
        },
        owner: {
            required: [true, 'Class must have an owner'],
            type: mongoose.Types.ObjectId,
            ref: 'User'
        },
        inviteCode: {
            type: String,
            default: new OTPGenerator({
                digits: false,
                specialChars: false,
                upperCaseAlphabets: true,
                lowerCaseAlphabets: false
            }, 7).generate()
        },
        slug: {
            type: String,
            default: new OTPGenerator({ 
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
                    ref: JoinedClassInfoModel,
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
                    ref: JoinedClassInfoModel,
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
    },
    {
        toJSON: {
            virtuals: true,
            versionKey: false,
        },
        toObject: {
            virtuals: true,
            versionKey: false,
        },
    }
);

ClassSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

ClassSchema.pre('save', function(next) {
    if (this.isNew) {
        this.inviteCode = new OTPGenerator({
            digits: false,
            specialChars: false,
            upperCaseAlphabets: true,
            lowerCaseAlphabets: false
        }, 7).generate();

        this.slug = new OTPGenerator({ 
            specialChars: false,
            digits: false,
        }, 15).generate();
    }
    next();
});

const ClassModel = mongoose.model<IClass>('Class', ClassSchema);

export default ClassModel;