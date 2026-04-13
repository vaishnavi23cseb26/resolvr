import React, { createContext, useEffect, useMemo, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "../hooks/useAuth";

type SocketState = {
  socket: Socket | null;
  connected: boolean;
};

export const SocketContext = createContext<SocketState>({ socket: null, connected: false });

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const url = (import.meta.env.VITE_API_URL as string) || "http://localhost:5000";
    const s = io(url, { withCredentials: true, transports: ["websocket"] });
    setSocket(s);

    s.on("connect", () => setConnected(true));
    s.on("disconnect", () => setConnected(false));

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, []);

  useEffect(() => {
    if (socket && user?.id) socket.emit("join", { userId: user.id });
  }, [socket, user?.id]);

  const value = useMemo(() => ({ socket, connected }), [socket, connected]);
  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

