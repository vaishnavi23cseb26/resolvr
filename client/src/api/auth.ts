import { http, setAccessToken } from "./http";

export type Role = "customer" | "agent" | "admin";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  isActive?: boolean;
};

export async function apiRegister(payload: { name: string; email: string; password: string }) {
  const res = await http.post("/api/auth/register", payload);
  const token = res.data?.data?.accessToken as string | undefined;
  if (token) setAccessToken(token);
  return res.data;
}

export async function apiLogin(payload: { email: string; password: string }) {
  const res = await http.post("/api/auth/login", payload);
  const token = res.data?.data?.accessToken as string | undefined;
  if (token) setAccessToken(token);
  return res.data;
}

export async function apiLogout() {
  const res = await http.post("/api/auth/logout");
  setAccessToken(null);
  return res.data;
}

export async function apiMe() {
  const res = await http.get("/api/auth/me");
  return res.data;
}

