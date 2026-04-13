import { http } from "./http";

export type TicketStatus = "open" | "in-progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "critical";

export type Ticket = {
  _id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
  category?: any;
  createdBy?: any;
  assignedTo?: any;
  attachments?: { url: string; filename: string }[];
  tags?: string[];
};

export async function apiListTickets(params: Record<string, any>) {
  const res = await http.get("/api/tickets", { params });
  return res.data;
}

export async function apiCreateTicket(payload: any) {
  const res = await http.post("/api/tickets", payload);
  return res.data;
}

export async function apiGetTicket(id: string) {
  const res = await http.get(`/api/tickets/${id}`);
  return res.data;
}

export async function apiUpdateTicket(id: string, payload: any) {
  const res = await http.put(`/api/tickets/${id}`, payload);
  return res.data;
}

export async function apiUpdateTicketStatus(id: string, status: TicketStatus) {
  const res = await http.put(`/api/tickets/${id}/status`, { status });
  return res.data;
}

export async function apiAssignTicket(id: string, agentId: string) {
  const res = await http.put(`/api/tickets/${id}/assign`, { agentId });
  return res.data;
}

export async function apiDeleteTicket(id: string) {
  const res = await http.delete(`/api/tickets/${id}`);
  return res.data;
}

export async function apiTicketComments(id: string) {
  const res = await http.get(`/api/tickets/${id}/comments`);
  return res.data;
}

export async function apiAddTicketComment(id: string, payload: { content: string; isInternal?: boolean }) {
  const res = await http.post(`/api/tickets/${id}/comments`, payload);
  return res.data;
}

export async function apiTicketActivity(id: string) {
  const res = await http.get(`/api/tickets/${id}/activity`);
  return res.data;
}

