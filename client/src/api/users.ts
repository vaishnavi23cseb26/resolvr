import { http } from "./http";

export async function apiUpdateProfile(payload: { name?: string; avatar?: string }) {
  const res = await http.put("/api/users/profile", payload);
  return res.data;
}

export async function apiChangePassword(payload: { currentPassword: string; newPassword: string }) {
  const res = await http.put("/api/users/password", payload);
  return res.data;
}

