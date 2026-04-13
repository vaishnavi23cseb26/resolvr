import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiCategories, apiCreateCategory, apiDeleteCategory, apiUpdateCategory } from "../api/categories";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

export default function AdminCategories() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ["categories"], queryFn: apiCategories });
  const items = data?.data?.items || [];

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#6366f1");
  const [localError, setLocalError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: apiCreateCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      setName("");
      setDescription("");
      setColor("#6366f1");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => apiUpdateCategory(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDeleteCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    try {
      await createMutation.mutateAsync({ name, description, color });
    } catch (err: any) {
      setLocalError(err?.response?.data?.message || err?.message || "Failed to create category");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xl font-semibold">Categories</div>
        <div className="text-sm text-slate-400">Create, edit, and delete ticket categories.</div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add category</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onCreate} className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="md:col-span-1">
              <div className="mb-1 text-xs font-medium text-slate-300">Name</div>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="md:col-span-2">
              <div className="mb-1 text-xs font-medium text-slate-300">Description</div>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="md:col-span-1">
              <div className="mb-1 text-xs font-medium text-slate-300">Color</div>
              <div className="flex gap-2">
                <Input value={color} onChange={(e) => setColor(e.target.value)} />
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-12 rounded-md border border-slate-700 bg-transparent p-1" />
              </div>
            </div>

            <div className="md:col-span-4 flex items-center gap-2">
              <Button type="submit" disabled={createMutation.isPending || !name.trim()}>
                {createMutation.isPending ? "Creating..." : "Create"}
              </Button>
              {localError ? <div className="text-sm text-red-300">{localError}</div> : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <div className="text-slate-300">Loading categories...</div> : null}
          {error ? <div className="text-red-300">Failed to load categories.</div> : null}

          <div className="space-y-2">
            {items.map((c: any) => (
              <div key={c._id} className="rounded-md border border-slate-700 bg-slate-900/40 p-3">
                <div className="grid grid-cols-1 gap-2 md:grid-cols-6 md:items-center">
                  <div className="md:col-span-2">
                    <div className="text-xs text-slate-400">Name</div>
                    <Input
                      defaultValue={c.name}
                      onBlur={(e) => updateMutation.mutate({ id: c._id, payload: { name: e.target.value } })}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <div className="text-xs text-slate-400">Description</div>
                    <Input
                      defaultValue={c.description}
                      onBlur={(e) => updateMutation.mutate({ id: c._id, payload: { description: e.target.value } })}
                    />
                  </div>
                  <div className="md:col-span-1">
                    <div className="text-xs text-slate-400">Color</div>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        defaultValue={c.color || "#6366f1"}
                        onBlur={(e) => updateMutation.mutate({ id: c._id, payload: { color: (e.target as HTMLInputElement).value } })}
                        className="h-10 w-12 rounded-md border border-slate-700 bg-transparent p-1"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (!confirm("Delete this category?")) return;
                          deleteMutation.mutate(c._id);
                        }}
                        disabled={deleteMutation.isPending}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {items.length === 0 && !isLoading ? <div className="text-slate-400">No categories.</div> : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

