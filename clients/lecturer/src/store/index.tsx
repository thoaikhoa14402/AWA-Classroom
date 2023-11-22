import { configureStore } from "@reduxjs/toolkit";
import userReducer from "~/store/reducers/userSlice";
import userRegisterReducer from "~/store/reducers/userRegisterSlice";
import classesReducer from "./reducers/classSlice";

export const store = configureStore({
    reducer: {
        user: userReducer,
        classes: classesReducer,
        userRegister: userRegisterReducer,
    }
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch;

export default store;