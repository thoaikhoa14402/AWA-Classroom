import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserType } from "./userSlice";

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
    _id: string;
    name: string;
    scale: number;
    published: boolean;
    order: number;
};

export interface IStudentList {
    user?: string;
    _id: string;
    student_id: string;
    full_name: string;
    email: string;
}

export interface IGradeList {
    user?: string;
    _id: string;
    student_id: string;
    grade_name: string[];
    grade: {
        col: string;
        value: number;
    }[];
}

export interface ClassType {
    _id: string;
    cid: string;
    name: string;
    banner?: string;
    createAt: Date;
    students: Array<UserType & { studentID: string }>;
    lecturers: Array<UserType>;
    owner: UserType;
    inviteCode: string;
    slug: string;
    studentPermission: IClassPermission;
    lecturerPermission: IClassPermission;
    ownerPermission: IClassPermission;
    gradeColumns: Array<IGradeColumn>;
    studentList: Array<IStudentList>;
    gradeList: Array<IGradeList>;
}

interface ClassState {
    classes: ClassType[];
    isLoading: boolean;
}

const initialState: ClassState = {
    classes: [],
    isLoading: true
};

export const classSlice = createSlice({
    name: "classes",
    initialState,
    reducers: {
        setClasses: (state, action: PayloadAction<ClassType[]>) => {
            state.classes = action.payload;
        },
        addClass: (state, action: PayloadAction<ClassType>) => {
            state.classes = [...state.classes, action.payload];
        },
        removeClass: (state, action: PayloadAction<string>) => {
            state.classes = state.classes.filter((classInfo) => classInfo.slug !== action.payload);
        },
        updateGradeComposition: (state, action: PayloadAction<{ classID: string, gradeCompositions: IGradeColumn[] }>) => {
            const { classID, gradeCompositions } = action.payload;
            const index = state.classes.findIndex((classInfo) => classInfo.slug === classID);
            if (index !== -1) {
                state.classes[index].gradeColumns = gradeCompositions;
            }
        },
        uploadStudentList: (state, action: PayloadAction<{ classID: string, studentList: IStudentList[] }>) => {
            const { classID, studentList } = action.payload;
            const index = state.classes.findIndex((classInfo) => classInfo.slug === classID);
            if (index !== -1) {
                state.classes[index].studentList = studentList;
            }
        },
        uploadGradeList: (state, action: PayloadAction<{ classID: string, gradeList: IGradeList[] }>) => {
            const { classID, gradeList } = action.payload;
            const index = state.classes.findIndex((classInfo) => classInfo.slug === classID);
            if (index !== -1) {
                state.classes[index].gradeList = gradeList;
            }
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
    },
});

export const { setClasses, addClass, removeClass, updateGradeComposition, uploadStudentList, uploadGradeList, setLoading } = classSlice.actions;
export default classSlice.reducer;

