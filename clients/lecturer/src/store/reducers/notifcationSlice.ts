// userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserType } from "./userSlice";
import { ClassType } from "./classSlice";

export interface NotificationType {
    _id: string;
    user: UserType;
    class: ClassType;
    message: string;
    navigation: string;
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
        readNotification: (state, action: PayloadAction<string>) => {
            const index = state.notifications.findIndex((item) => item._id === action.payload);
            if (index !== -1) {
                state.notifications[index].readable = true;
            }
        },
        setNotificationLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        }
    },
});

export const { pushNotification, setNotifications, setNotificationLoading, readNotification } = notificationSlice.actions;
export default notificationSlice.reducer;

