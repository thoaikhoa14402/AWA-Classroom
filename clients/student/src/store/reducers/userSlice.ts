// userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import authStorage from "~/utils/auth.storage";

export interface UserType {
    _id: string;
    username: string;
    email: string;
    lastname: string;
    firstname: string;
    avatar?: string;
    phoneNumber?: string;
    role: string;
}

export interface UserProfile {
    user: UserType,
    access_token: string;
}

interface UserState {
    profile: UserType | null;
    access_token?: string;
}

const initialState: UserState = {
    profile: authStorage.getUserProfile() || null,
};

export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUserProfile: (state, action: PayloadAction<UserProfile>) => {
            authStorage.login(action.payload.user, action.payload.access_token);
            state.profile = action.payload.user;
        },
        clearUserProfile: (state) => {
            state.profile = null;
            authStorage.logout();
        },
    },
});

export const { setUserProfile, clearUserProfile } = userSlice.actions;
export default userSlice.reducer;

