import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTickets } from "../hooks/useTickets";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import StatusBadge from "../components/tickets/StatusBadge";
import PriorityBadge from "../components/tickets/PriorityBadge";
import { formatDate } from "../utils/formatDate";

export default function TicketList() {
  const { user } = useAuth();
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [search, setSearch] = useState("");
  const params = useMemo(() => ({ page: 1, limit: 10, status: status || undefined, priority: priority || undefined, search: search || undefined }), [status, priority, search]);
  const { data, isLoading, error } = useTickets(params);
  const items = data?.data?.items || [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xl font-semibold">Tickets</div>
          <div className="text-sm text-slate-400">
            {user?.role === "admin" ? "All tickets" : user?.role === "agent" ? "Assigned to you" : "Your tickets"}
          </div>
        </div>
        {user?.role === "customer" ? (
          <Link to="/tickets/new">
            <Button>New ticket</Button>
          </Link>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <div className="mb-1 text-xs font-medium text-slate-300">Search</div>
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Title or description" />
          </div>
          <div>
            <div className="mb-1 text-xs font-medium text-slate-300">Status</div>
            <select
              className="h-10 w-full rounded-md border border-slate-700 bg-slate-900/40 px-3 text-sm text-white"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All</option>
              <option value="open">open</option>
              <option value="in-progress">in-progress</option>
              <option value="resolved">resolved</option>
              <option value="closed">closed</option>
            </select>
          </div>
          <div>
            <div className="mb-1 text-xs font-medium text-slate-300">Priority</div>
            <select
              className="h-10 w-full rounded-md border border-slate-700 bg-slate-900/40 px-3 text-sm text-white"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="">All</option>
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
              <option value="critical">critical</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? <div className="text-slate-300">Loading tickets...</div> : null}
      {error ? <div className="text-red-300">Failed to load tickets.</div> : null}

      <div className="space-y-3">
        {items.map((t: any) => (
          <Link key={t._id} to={`/tickets/${t._id}`} className="block">
            <Card className="hover:border-slate-600">
              <CardContent className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white">{t.title}</div>
                  <div className="mt-1 text-xs text-slate-400">
                    Updated {formatDate(t.updatedAt)} • Created {formatDate(t.createdAt)}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={t.status} />
                  <PriorityBadge priority={t.priority} />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {items.length === 0 && !isLoading ? <div className="text-slate-400">No tickets found.</div> : null}
      </div>
    </div>
  );
}

