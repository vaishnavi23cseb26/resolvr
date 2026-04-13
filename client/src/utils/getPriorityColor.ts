import type { TicketPriority } from "../api/tickets";

export function getPriorityColor(priority: TicketPriority) {
  switch (priority) {
    case "low":
      return "bg-green-600/20 text-green-300 border-green-500/40";
    case "medium":
      return "bg-yellow-600/20 text-yellow-300 border-yellow-500/40";
    case "high":
      return "bg-orange-600/20 text-orange-300 border-orange-500/40";
    case "critical":
      return "bg-red-600/20 text-red-300 border-red-500/40";
    default:
      return "bg-slate-700/20 text-slate-200 border-slate-600/40";
  }
}

