// userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import authStorage from "~/utils/auth.storage";

export interface UserProfile {
    _id: string;
    username: string;
    email: string;
    lastname: string;
    firstname: string;
	avatar?: string;
	phoneNumber?: string;
    role: string;
}

interface UserState {
    profile: UserProfile | null;
}

const initialState: UserState = {
    profile: authStorage.getUserProfile() || null,
};

export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUserProfile: (state, action: PayloadAction<UserProfile>) => {
            state.profile = action.payload;
            authStorage.login(action.payload);
        },
        clearUserProfile: (state) => {
            state.profile = null;
            authStorage.logout();
        },
    },
});

export const { setUserProfile, clearUserProfile } = userSlice.actions;
export default userSlice.reducer;

