import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiAdminToggleUser, apiAdminUpdateUserRole, apiAdminUsers } from "../api/admin";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

export default function AdminUsers() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ["admin-users"], queryFn: apiAdminUsers });
  const users = data?.data?.items || [];

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => apiAdminUpdateUserRole(id, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => apiAdminToggleUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xl font-semibold">Users</div>
        <div className="text-sm text-slate-400">Manage roles and activation.</div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All users</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <div className="text-slate-300">Loading users...</div> : null}
          {error ? <div className="text-red-300">Failed to load users.</div> : null}

          <div className="space-y-2">
            {users.map((u: any) => (
              <div key={u._id} className="rounded-md border border-slate-700 bg-slate-900/40 p-3">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-white">
                      {u.name || "—"} <span className="text-slate-400">({u.email})</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                      <Badge className="border-slate-600/40 text-slate-200">{u.role}</Badge>
                      <span>{u.isActive ? "active" : "inactive"}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      className="h-9 rounded-md border border-slate-700 bg-slate-900/40 px-3 text-sm text-white"
                      value={u.role}
                      onChange={(e) => roleMutation.mutate({ id: u._id, role: e.target.value })}
                      disabled={roleMutation.isPending}
                    >
                      <option value="customer">customer</option>
                      <option value="agent">agent</option>
                      <option value="admin">admin</option>
                    </select>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => toggleMutation.mutate(u._id)}
                      disabled={toggleMutation.isPending}
                    >
                      {u.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {users.length === 0 && !isLoading ? <div className="text-slate-400">No users.</div> : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

