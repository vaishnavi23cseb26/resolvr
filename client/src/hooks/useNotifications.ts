import { useContext, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiNotifications } from "../api/notifications";
import { SocketContext } from "../context/SocketContext";

export function useNotifications() {
  const qc = useQueryClient();
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    if (!socket) return;
    const handler = () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    };
    socket.on("notification:new", handler);
    return () => {
      socket.off("notification:new", handler);
    };
  }, [socket, qc]);

  return useQuery({
    queryKey: ["notifications"],
    queryFn: apiNotifications,
  });
}

