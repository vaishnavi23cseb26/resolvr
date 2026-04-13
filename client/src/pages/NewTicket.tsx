import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiCategories } from "../api/categories";
import { apiCreateTicket } from "../api/tickets";
import { apiUpload } from "../api/upload";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";

export default function NewTicket() {
  const nav = useNavigate();
  const { data: catsRes } = useQuery({ queryKey: ["categories"], queryFn: apiCategories });
  const categories = catsRes?.data?.items || [];

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("low");
  const [files, setFiles] = useState<FileList | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: apiCreateTicket,
  });

  const uploadMutation = useMutation({
    mutationFn: apiUpload,
  });

  const canSubmit = useMemo(() => title.trim().length > 0 && description.trim().length > 0, [title, description]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const attachments: { url: string; filename: string }[] = [];
      if (files && files.length > 0) {
        for (const f of Array.from(files)) {
          const up = await uploadMutation.mutateAsync(f);
          attachments.push({ url: up?.data?.url, filename: up?.data?.filename });
        }
      }

      const res = await createMutation.mutateAsync({
        title,
        description,
        category: category || null,
        priority,
        attachments,
      });

      const id = res?.data?.ticket?._id;
      if (id) nav(`/tickets/${id}`);
      else nav("/tickets");
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to create ticket");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xl font-semibold">Create ticket</div>
        <div className="text-sm text-slate-400">Describe the issue and attach files if needed.</div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New ticket</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-300">Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-300">Description</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-300">Category</label>
                <select
                  className="h-10 w-full rounded-md border border-slate-700 bg-slate-900/40 px-3 text-sm text-white"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">None</option>
                  {categories.map((c: any) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-300">Priority</label>
                <select
                  className="h-10 w-full rounded-md border border-slate-700 bg-slate-900/40 px-3 text-sm text-white"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                  <option value="critical">critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-300">Attachments</label>
              <input
                type="file"
                multiple
                className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-md file:border-0 file:bg-slate-700 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-600"
                onChange={(e) => setFiles(e.target.files)}
              />
              <div className="mt-1 text-xs text-slate-500">Uploads go to Cloudinary via the backend.</div>
            </div>

            {error ? <div className="text-sm text-red-300">{error}</div> : null}

            <div className="flex gap-2">
              <Button type="submit" disabled={!canSubmit || createMutation.isPending || uploadMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create ticket"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => nav("/tickets")}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

