import { apiClient } from './client';
import type { ApiResponse, AppNotification } from './types';

export const notificationsApi = {
  getAll: (limit = 50, member = true): Promise<ApiResponse<AppNotification[]>> => apiClient.get(`/api/notifications?limit=${limit}&member=${member}`),
  unreadCount: (member = true): Promise<ApiResponse<number>> => apiClient.get(`/api/notifications/unread-count?member=${member}`),
  markRead: (id: string, member = true): Promise<ApiResponse<AppNotification>> => apiClient.put(`/api/notifications/${id}/read?member=${member}`),
  markAllRead: (member = true): Promise<ApiResponse<unknown>> => apiClient.put(`/api/notifications/mark-all-read?member=${member}`),
};
