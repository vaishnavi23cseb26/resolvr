import { http } from "./http";

export async function apiNotifications() {
  const res = await http.get("/api/notifications");
  return res.data;
}

export async function apiReadAllNotifications() {
  const res = await http.put("/api/notifications/read-all");
  return res.data;
}

export async function apiReadNotification(id: string) {
  const res = await http.put(`/api/notifications/${id}/read`);
  return res.data;
}

