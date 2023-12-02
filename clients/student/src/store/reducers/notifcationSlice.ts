// userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserType } from "./userSlice";

export interface NotificationType {
    _id: string;
    user: UserType;
    message: string;
    createAt: Date;
    formatedDate: string;
    readable: boolean;
}

export interface NotificationState {
    notifications: NotificationType[];
    isLoading: boolean;
}

const initialState: NotificationState = {
    notifications: [],
    isLoading: true,
};

export const notificationSlice = createSlice({
    name: "notifications",
    initialState,
    reducers: {
        setNotifications: (state, action: PayloadAction<NotificationType[]>) => {
            state.notifications = action.payload;
        },
        pushNotification: (state, action: PayloadAction<NotificationType>) => {
            state.notifications.unshift(action.payload);
        },
        setNotificationLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        }
    },
});

export const { pushNotification, setNotifications, setNotificationLoading } = notificationSlice.actions;
export default notificationSlice.reducer;

