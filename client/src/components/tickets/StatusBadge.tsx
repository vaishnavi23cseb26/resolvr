import { Badge } from "../ui/badge";
import type { TicketStatus } from "../../api/tickets";
import { getStatusColor } from "../../utils/getStatusColor";

export default function StatusBadge({ status }: { status: TicketStatus }) {
  return <Badge className={`border ${getStatusColor(status)}`}>{status}</Badge>;
}

