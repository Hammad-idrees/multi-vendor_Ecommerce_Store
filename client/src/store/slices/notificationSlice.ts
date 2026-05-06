import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import type { Notification } from '../../types';

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
}

const initialState: NotificationState = {
    notifications: [],
    unreadCount: 0,
    loading: false,
};

export const fetchNotifications = createAsyncThunk('notifications/fetch', async () => {
    const { data } = await api.get('/notifications');
    return data;
});

export const fetchUnreadCount = createAsyncThunk('notifications/unreadCount', async () => {
    const { data } = await api.get('/notifications/unread-count');
    return data.count;
});

export const markAsRead = createAsyncThunk('notifications/markRead', async (id: string) => {
    const { data } = await api.put(`/notifications/${id}/read`);
    return data;
});

export const markAllRead = createAsyncThunk('notifications/markAllRead', async () => {
    await api.put('/notifications/read-all');
});

const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        addNotification: (state, action) => {
            state.notifications.unshift(action.payload);
            state.unreadCount++;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.notifications = action.payload;
                state.loading = false;
            })
            .addCase(fetchUnreadCount.fulfilled, (state, action) => {
                state.unreadCount = action.payload;
            })
            .addCase(markAsRead.fulfilled, (state, action) => {
                const idx = state.notifications.findIndex((n) => n._id === action.payload._id);
                if (idx !== -1) state.notifications[idx].isRead = true;
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            })
            .addCase(markAllRead.fulfilled, (state) => {
                state.notifications.forEach((n) => (n.isRead = true));
                state.unreadCount = 0;
            });
    },
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
