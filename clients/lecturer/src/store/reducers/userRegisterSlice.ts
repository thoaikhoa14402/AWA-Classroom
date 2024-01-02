// userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserRegisterType {
    username: string;
    email: string;
    role: string;
}

export interface UserRegisterProfile {
    user: UserRegisterType,
    verification_token: string;
}

interface UserRegisterState {
    profile: UserRegisterType | null;
    verification_token?: string;
}

const initialState: UserRegisterState = {
    profile: null,
};

export const userRegisterSlice = createSlice({
    name: "userRegister",
    initialState,
    reducers: {
        setUserRegisterProfile: (state, action: PayloadAction<UserRegisterProfile>) => {
            state.profile = action.payload.user;
            state.verification_token = action.payload.verification_token;
        },
        clearUserRegisterProfile: (state) => {
            state.profile = null;
            state.verification_token = ''
        },
    },
});

export const { setUserRegisterProfile, clearUserRegisterProfile } = userRegisterSlice.actions;
export default userRegisterSlice.reducer;

