import { http } from "./http";

export async function apiAdminUsers() {
  const res = await http.get("/api/admin/users");
  return res.data;
}

export async function apiAdminUpdateUserRole(id: string, role: string) {
  const res = await http.put(`/api/admin/users/${id}/role`, { role });
  return res.data;
}

export async function apiAdminToggleUser(id: string) {
  const res = await http.put(`/api/admin/users/${id}/toggle`);
  return res.data;
}

export async function apiAdminStats() {
  const res = await http.get("/api/admin/stats");
  return res.data;
}

