import { http } from "./http";

export async function apiCategories() {
  const res = await http.get("/api/categories");
  return res.data;
}

export async function apiCreateCategory(payload: { name: string; description?: string; color?: string }) {
  const res = await http.post("/api/categories", payload);
  return res.data;
}

export async function apiUpdateCategory(id: string, payload: any) {
  const res = await http.put(`/api/categories/${id}`, payload);
  return res.data;
}

export async function apiDeleteCategory(id: string) {
  const res = await http.delete(`/api/categories/${id}`);
  return res.data;
}

