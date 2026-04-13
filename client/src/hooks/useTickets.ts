import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiListTickets } from "../api/tickets";

export function useTickets(params: Record<string, any>) {
  return useQuery({
    queryKey: ["tickets", params],
    queryFn: () => apiListTickets(params),
    placeholderData: keepPreviousData,
  });
}

