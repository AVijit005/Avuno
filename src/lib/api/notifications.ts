import { apiGet, apiPatch, apiDelete, apiPost } from "./fetch";

export interface NotificationResponse {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  actionUrl: string | null;
  image: string | null;
  createdAt: string;
  readAt: string | null;
}

export interface NotificationPreferences {
  emailEnabled: boolean;
  pushEnabled: boolean;
  browserEnabled: boolean;
  marketingEnabled: boolean;
  weeklyWrapped: boolean;
  monthlyReport: boolean;
  friendActivity: boolean;
  reminders: boolean;
}

export interface UpdateNotificationPreferences {
  emailEnabled?: boolean;
  pushEnabled?: boolean;
  browserEnabled?: boolean;
  marketingEnabled?: boolean;
  weeklyWrapped?: boolean;
  monthlyReport?: boolean;
  friendActivity?: boolean;
  reminders?: boolean;
}

export interface NotificationListResponse {
  items: NotificationResponse[];
  total: number;
  unreadCount: number;
  hasMore: boolean;
  cursor: string | null;
}

export async function listNotifications(params?: {
  cursor?: string;
  limit?: number;
}): Promise<NotificationListResponse> {
  const qs = new URLSearchParams();
  if (params?.cursor) qs.set("cursor", params.cursor);
  if (params?.limit) qs.set("limit", String(params.limit));
  const qsStr = qs.toString();
  return apiGet<NotificationListResponse>(`/notifications${qsStr ? `?${qsStr}` : ""}`);
}

export async function markNotificationRead(id: string): Promise<void> {
  return apiPatch(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  return apiPatch("/notifications/read-all");
}

export async function deleteNotification(id: string): Promise<void> {
  return apiDelete(`/notifications/${id}`);
}

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  return apiGet<NotificationPreferences>("/notifications/preferences");
}

export async function updateNotificationPreferences(
  input: UpdateNotificationPreferences,
): Promise<NotificationPreferences> {
  return apiPatch<NotificationPreferences>("/notifications/preferences", input);
}

export async function sendTestNotification(
  title: string,
  body: string,
  type?: string,
): Promise<void> {
  return apiPost("/notifications/test", { title, body, type });
}
