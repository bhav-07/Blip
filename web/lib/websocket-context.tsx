import React, { createContext, useRef, useEffect, ReactNode, FC } from "react";

interface WebSocketContextType {
  current: WebSocket | null;
}

export const WebSocketContext = createContext<WebSocketContextType | null>(
  null
);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: FC<WebSocketProviderProps> = ({ children }) => {
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const env = process.env.NEXT_PUBLIC_NGINX_ENV || "local";
    const host = process.env.NEXT_PUBLIC_NGINX_HOST || "localhost";
    const port = process.env.NEXT_PUBLIC_NGINX_PORT || "3001";

    const serverUrl =
      env === "local"
        ? `ws://${host}:${port}/ws/chat`
        : `wss://${host}/ws/chat`;

    ws.current = new WebSocket(serverUrl);

    ws.current.onopen = () => {
      console.log("WebSocket connection opened");
    };

    ws.current.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      console.log("Closing WebSocket connection...");
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ current: ws.current }}>
      {children}
    </WebSocketContext.Provider>
  );
};
