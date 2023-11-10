// userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserProfile {
    _id: string,
    username: string,
    email: string,
    lastname?: string,
    firstname?: string,
}

interface UserState {
  profile: UserProfile | null;
}

const initialState: UserState = {
  profile: null,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
    },
    clearUserProfile: (state) => {
      state.profile = null;
    },
  },
});

export const { setUserProfile, clearUserProfile } = userSlice.actions;
export default userSlice.reducer;
