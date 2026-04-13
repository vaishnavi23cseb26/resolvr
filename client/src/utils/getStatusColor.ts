import type { TicketStatus } from "../api/tickets";

export function getStatusColor(status: TicketStatus) {
  switch (status) {
    case "open":
      return "bg-blue-600/20 text-blue-300 border-blue-500/40";
    case "in-progress":
      return "bg-yellow-600/20 text-yellow-300 border-yellow-500/40";
    case "resolved":
      return "bg-green-600/20 text-green-300 border-green-500/40";
    case "closed":
      return "bg-slate-600/20 text-slate-300 border-slate-500/40";
    default:
      return "bg-slate-700/20 text-slate-200 border-slate-600/40";
  }
}

