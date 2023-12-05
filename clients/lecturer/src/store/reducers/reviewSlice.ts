// userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ClassType } from "./classSlice";
import { UserType } from "./userSlice";

export interface ICommentType {
    _id?: string;
    id: string;
    sender: UserType;
    content: string;
    createdAt: Date;
    formatedDate: string;
}

export interface ReviewType {
    _id: string;
    class: ClassType;
    joinedInfo: any;
    reason: string;
    expected: number;
    grade: number;
    composition: string;
    opened: boolean;
    comments: ICommentType[];
    finalGrade?: number;
    formatedDate: string;
    readable: boolean;
}

export interface ReviewState {
    reviews: ReviewType[];
    isLoading: boolean;
}

const initialState: ReviewState = {
    reviews: [],
    isLoading: true,
};

export const reviewSlice = createSlice({
    name: "reviews",
    initialState,
    reducers: {
        setReviews: (state, action: PayloadAction<ReviewType[]>) => {
            state.reviews = action.payload;
        },
        pushReview: (state, action: PayloadAction<ReviewType>) => {
            state.reviews.unshift(action.payload);
        },
        setComments: (state, action: PayloadAction<{ reviewID: string, comments: ICommentType[] }>) => {
            const { reviewID, comments } = action.payload;
            
            const reviewIndex = state.reviews.findIndex(review => review._id === reviewID);

            if (reviewIndex !== -1) {
                state.reviews[reviewIndex].comments = comments;
            }
        },
        setReviewLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        }
    },
});

export const { pushReview, setReviews, setReviewLoading, setComments } = reviewSlice.actions;
export default reviewSlice.reducer;

