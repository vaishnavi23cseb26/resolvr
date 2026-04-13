import { Link, NavLink, Outlet } from "react-router-dom";
import { Bell, LogOut, Ticket, LayoutDashboard, User, Users, Tags } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../ui/button";
import { useNotifications } from "../../hooks/useNotifications";
import { Badge } from "../ui/badge";
import { formatDate } from "../../utils/formatDate";

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
          isActive ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-900/50 hover:text-white",
        ].join(" ")
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { data } = useNotifications();
  const items = data?.data?.items || [];
  const unread = items.filter((n: any) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="border-b border-slate-800 bg-slate-950/40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/dashboard" className="font-semibold tracking-tight">
            <span className="text-indigo-400">Resolvr</span> <span className="text-slate-300">– Issue Ticketing</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button className="rounded-md p-2 hover:bg-slate-800" aria-label="Notifications">
                <Bell className="h-5 w-5 text-slate-200" />
              </button>
              {unread > 0 ? (
                <span className="absolute -right-1 -top-1 rounded-full bg-indigo-500 px-1.5 text-xs">{unread}</span>
              ) : null}
            </div>
            <div className="hidden text-right md:block">
              <div className="text-sm">{user?.name || user?.email}</div>
              <div className="text-xs text-slate-400">{user?.role}</div>
            </div>
            <Button variant="secondary" size="sm" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 py-4 md:grid-cols-[220px_1fr]">
        <aside className="rounded-xl border border-slate-800 bg-slate-950/30 p-3">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Navigation</div>
          <div className="space-y-1">
            <NavItem to="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" />
            <NavItem to="/tickets" icon={<Ticket className="h-4 w-4" />} label="Tickets" />
            <NavItem to="/profile" icon={<User className="h-4 w-4" />} label="Profile" />

            {user?.role === "admin" ? (
              <>
                <div className="my-3 border-t border-slate-800" />
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Admin</div>
                <NavItem to="/admin/users" icon={<Users className="h-4 w-4" />} label="Users" />
                <NavItem to="/admin/categories" icon={<Tags className="h-4 w-4" />} label="Categories" />
              </>
            ) : null}
          </div>

          <div className="mt-4 border-t border-slate-800 pt-3">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Latest</div>
            <div className="space-y-2">
              {items.slice(0, 3).map((n: any) => (
                <Link key={n._id} to={n.link || "/tickets"} className="block rounded-md bg-slate-900/40 p-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-xs text-slate-200 line-clamp-2">{n.message}</div>
                    {!n.isRead ? <Badge className="border-indigo-500/40 text-indigo-200">new</Badge> : null}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400">{formatDate(n.createdAt)}</div>
                </Link>
              ))}
              {items.length === 0 ? <div className="text-xs text-slate-500">No notifications yet.</div> : null}
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

