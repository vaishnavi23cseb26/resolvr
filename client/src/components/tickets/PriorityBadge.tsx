import { Badge } from "../ui/badge";
import type { TicketPriority } from "../../api/tickets";
import { getPriorityColor } from "../../utils/getPriorityColor";

export default function PriorityBadge({ priority }: { priority: TicketPriority }) {
  return <Badge className={`border ${getPriorityColor(priority)}`}>{priority}</Badge>;
}

