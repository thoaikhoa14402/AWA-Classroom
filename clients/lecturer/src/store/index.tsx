import { configureStore } from "@reduxjs/toolkit";
import userReducer from "~/store/reducers/userSlice";
import userRegisterReducer from "~/store/reducers/userRegisterSlice";

export const store = configureStore({
    reducer: {
        user: userReducer,
        userRegister: userRegisterReducer,
    }
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch;

export default store;