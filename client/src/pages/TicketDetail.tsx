import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGetTicket, apiTicketActivity, apiTicketComments, apiAddTicketComment, apiUpdateTicketStatus, apiAssignTicket, apiDeleteTicket } from "../api/tickets";
import { apiAdminUsers } from "../api/admin";
import { useAuth } from "../hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import StatusBadge from "../components/tickets/StatusBadge";
import PriorityBadge from "../components/tickets/PriorityBadge";
import { formatDate } from "../utils/formatDate";

export default function TicketDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const { user } = useAuth();

  const { data: ticketRes, isLoading: ticketLoading, error: ticketError } = useQuery({
    queryKey: ["ticket", id],
    queryFn: () => apiGetTicket(id!),
    enabled: Boolean(id),
  });
  const ticket = ticketRes?.data?.ticket;

  const { data: commentsRes } = useQuery({
    queryKey: ["ticket-comments", id],
    queryFn: () => apiTicketComments(id!),
    enabled: Boolean(id),
  });
  const comments = commentsRes?.data?.items || [];

  const { data: activityRes } = useQuery({
    queryKey: ["ticket-activity", id],
    queryFn: () => apiTicketActivity(id!),
    enabled: Boolean(id),
  });
  const activity = activityRes?.data?.items || [];

  const { data: usersRes } = useQuery({
    queryKey: ["admin-users"],
    queryFn: apiAdminUsers,
    enabled: user?.role === "admin",
  });
  const agents = (usersRes?.data?.items || []).filter((u: any) => u.role === "agent" && u.isActive);

  const [comment, setComment] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [status, setStatus] = useState("");
  const [agentId, setAgentId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const addCommentMutation = useMutation({
    mutationFn: (payload: any) => apiAddTicketComment(id!, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ticket-comments", id] });
      qc.invalidateQueries({ queryKey: ["ticket-activity", id] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: (s: any) => apiUpdateTicketStatus(id!, s),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ticket", id] });
      qc.invalidateQueries({ queryKey: ["ticket-activity", id] });
      qc.invalidateQueries({ queryKey: ["tickets"] });
    },
  });

  const assignMutation = useMutation({
    mutationFn: (a: any) => apiAssignTicket(id!, a),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ticket", id] });
      qc.invalidateQueries({ queryKey: ["ticket-activity", id] });
      qc.invalidateQueries({ queryKey: ["tickets"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiDeleteTicket(id!),
  });

  const canInternal = user?.role === "agent" || user?.role === "admin";
  const canStatus = user?.role === "agent" || user?.role === "admin";
  const canAssign = user?.role === "admin";
  const canDelete = user?.role === "admin";

  const attachmentItems = ticket?.attachments || [];

  const onSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await addCommentMutation.mutateAsync({ content: comment, isInternal });
      setComment("");
      setIsInternal(false);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to add comment");
    }
  };

  const statusOptions = useMemo(() => ["open", "in-progress", "resolved", "closed"], []);

  if (ticketLoading) return <div className="text-slate-300">Loading ticket...</div>;
  if (ticketError) return <div className="text-red-300">Failed to load ticket.</div>;
  if (!ticket) return <div className="text-slate-400">Ticket not found.</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="truncate text-xl font-semibold">{ticket.title}</div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
            <span className="text-xs text-slate-400">Created {formatDate(ticket.createdAt)}</span>
          </div>
        </div>
        {canDelete ? (
          <Button
            variant="destructive"
            onClick={async () => {
              if (!confirm("Delete this ticket?")) return;
              await deleteMutation.mutateAsync();
              window.location.href = "/tickets";
            }}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-sm text-slate-200">{ticket.description}</div>

            {attachmentItems.length ? (
              <div className="mt-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Attachments</div>
                <div className="mt-2 space-y-2">
                  {attachmentItems.map((a: any) => (
                    <a
                      key={a.url}
                      href={a.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-md border border-slate-700 bg-slate-900/40 px-3 py-2 text-sm text-indigo-200 hover:bg-slate-900/70"
                    >
                      {a.filename}
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {canAssign ? (
              <div>
                <div className="mb-1 text-xs font-medium text-slate-300">Assign agent</div>
                <div className="flex gap-2">
                  <select
                    className="h-10 flex-1 rounded-md border border-slate-700 bg-slate-900/40 px-3 text-sm text-white"
                    value={agentId}
                    onChange={(e) => setAgentId(e.target.value)}
                  >
                    <option value="">Select agent</option>
                    {agents.map((a: any) => (
                      <option key={a._id} value={a._id}>
                        {a.name} ({a.email})
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="secondary"
                    onClick={async () => {
                      if (!agentId) return;
                      await assignMutation.mutateAsync(agentId);
                      setAgentId("");
                    }}
                    disabled={assignMutation.isPending || !agentId}
                  >
                    {assignMutation.isPending ? "Assigning..." : "Assign"}
                  </Button>
                </div>
              </div>
            ) : null}

            {canStatus ? (
              <div>
                <div className="mb-1 text-xs font-medium text-slate-300">Update status</div>
                <div className="flex gap-2">
                  <select
                    className="h-10 flex-1 rounded-md border border-slate-700 bg-slate-900/40 px-3 text-sm text-white"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="">Select status</option>
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="secondary"
                    onClick={async () => {
                      if (!status) return;
                      await statusMutation.mutateAsync(status);
                      setStatus("");
                    }}
                    disabled={statusMutation.isPending || !status}
                  >
                    {statusMutation.isPending ? "Updating..." : "Update"}
                  </Button>
                </div>
              </div>
            ) : null}

            <div className="rounded-md border border-slate-700 bg-slate-900/40 p-3 text-xs text-slate-300">
              <div className="font-semibold text-slate-200">Participants</div>
              <div className="mt-2">
                <div>Customer: {ticket.createdBy?.email || "—"}</div>
                <div>Assigned: {ticket.assignedTo?.email || "Unassigned"}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Comments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <form onSubmit={onSubmitComment} className="space-y-2">
              <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write a comment..." />
              {canInternal ? (
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <input type="checkbox" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} />
                  Internal note (agents/admins only)
                </label>
              ) : null}
              {error ? <div className="text-sm text-red-300">{error}</div> : null}
              <Button type="submit" disabled={!comment.trim() || addCommentMutation.isPending}>
                {addCommentMutation.isPending ? "Posting..." : "Post"}
              </Button>
            </form>

            <div className="space-y-2">
              {comments.map((c: any) => (
                <div
                  key={c._id}
                  className={[
                    "rounded-md border p-3 text-sm",
                    c.isInternal ? "border-yellow-500/30 bg-yellow-600/10" : "border-slate-700 bg-slate-900/40",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs text-slate-300">
                      {c.author?.name || c.author?.email} • {formatDate(c.createdAt)}
                    </div>
                    {c.isInternal ? <span className="text-xs text-yellow-300">internal</span> : null}
                  </div>
                  <div className="mt-2 whitespace-pre-wrap text-slate-200">{c.content}</div>
                </div>
              ))}
              {comments.length === 0 ? <div className="text-sm text-slate-400">No comments yet.</div> : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {activity.map((a: any) => (
              <div key={a._id} className="rounded-md border border-slate-700 bg-slate-900/40 p-3 text-sm">
                <div className="text-slate-200">{a.action}</div>
                <div className="mt-1 text-xs text-slate-400">
                  {a.performedBy?.email} • {formatDate(a.createdAt)}
                </div>
                {a.details ? <div className="mt-2 text-xs text-slate-300">{a.details}</div> : null}
              </div>
            ))}
            {activity.length === 0 ? <div className="text-sm text-slate-400">No activity yet.</div> : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

