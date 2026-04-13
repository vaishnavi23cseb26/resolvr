import { useMemo } from "react";
import { useAuth } from "../hooks/useAuth";
import { useTickets } from "../hooks/useTickets";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { apiAdminStats } from "../api/admin";
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line } from "recharts";

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold text-white">{value}</div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data: ticketsRes, isLoading: ticketsLoading } = useTickets({ page: 1, limit: 50 });

  const { data: statsRes, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: apiAdminStats,
    enabled: user?.role === "admin",
  });

  const tickets = ticketsRes?.data?.items || [];

  const counts = useMemo(() => {
    const c = { open: 0, "in-progress": 0, resolved: 0, closed: 0 } as Record<string, number>;
    for (const t of tickets) c[t.status] = (c[t.status] || 0) + 1;
    return c;
  }, [tickets]);

  const statusData = [
    { name: "Open", value: counts["open"] },
    { name: "In Progress", value: counts["in-progress"] },
    { name: "Resolved", value: counts["resolved"] },
    { name: "Closed", value: counts["closed"] },
  ];

  const byPriority = statsRes?.data?.byPriority || [];
  const priorityData = ["low", "medium", "high", "critical"].map((p) => ({
    name: p,
    value: byPriority.find((x: any) => x._id === p)?.count || 0,
  }));

  const last7 = useMemo(() => {
    const map: Record<string, number> = {};
    const now = new Date();
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      map[key] = 0;
    }
    for (const t of tickets) {
      const key = String(t.createdAt).slice(0, 10);
      if (map[key] !== undefined) map[key] += 1;
    }
    return Object.entries(map).map(([date, value]) => ({ date: date.slice(5), value }));
  }, [tickets]);

  const loading = ticketsLoading || (user?.role === "admin" && statsLoading);

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xl font-semibold">Dashboard</div>
        <div className="text-sm text-slate-400">
          {user?.role === "admin"
            ? "Organization overview"
            : user?.role === "agent"
              ? "Your assigned tickets"
              : "Your tickets"}
        </div>
      </div>

      {loading ? <div className="text-slate-300">Loading dashboard...</div> : null}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <StatCard label="Open" value={counts["open"]} />
        <StatCard label="In Progress" value={counts["in-progress"]} />
        <StatCard label="Resolved" value={counts["resolved"]} />
        <StatCard label="Closed" value={counts["closed"]} />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Tickets by Status</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80}>
                  {statusData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={
                        entry.name === "Open"
                          ? "#3b82f6"
                          : entry.name === "In Progress"
                            ? "#f59e0b"
                            : entry.name === "Resolved"
                              ? "#22c55e"
                              : "#94a3b8"
                      }
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Tickets created (last 7 days)</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last7}>
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {user?.role === "admin" ? (
        <Card>
          <CardHeader>
            <CardTitle>Tickets by Priority</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData}>
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

