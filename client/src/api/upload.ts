import { http } from "./http";

export async function apiUpload(file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await http.post("/api/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

