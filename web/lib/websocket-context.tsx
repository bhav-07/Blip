"use client";

import React, {
  createContext,
  useRef,
  useEffect,
  useState,
  ReactNode,
  FC,
} from "react";

interface WebSocketContextType {
  current: WebSocket | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

export const WebSocketContext = createContext<WebSocketContextType>({
  current: null,
  isConnected: false,
  isConnecting: false,
  error: null,
});

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: FC<WebSocketProviderProps> = ({ children }) => {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const env = process.env.NEXT_PUBLIC_NGINX_ENV || "local";
    const host = process.env.NEXT_PUBLIC_NGINX_HOST || "localhost";
    const port = process.env.NEXT_PUBLIC_NGINX_PORT || "8080";

    const serverUrl =
      env === "local"
        ? `ws://${host}:${port}/ws/chat`
        : `wss://${host}/ws/chat`;

    const connectWebSocket = () => {
      try {
        setIsConnecting(true);
        setError(null);

        ws.current = new WebSocket(serverUrl);

        ws.current.onopen = () => {
          console.log("WebSocket connected successfully");
          setIsConnected(true);
          setIsConnecting(false);
          setError(null);
        };

        ws.current.onclose = (event) => {
          console.log("WebSocket connection closed:", event.code, event.reason);
          setIsConnected(false);
          setIsConnecting(false);

          // Attempt to reconnect if the closure wasn't intentional
          if (event.code !== 1000 && event.code !== 1001) {
            setTimeout(connectWebSocket, 3000); // Retry after 3 seconds
          }
        };

        ws.current.onerror = (event) => {
          console.error("WebSocket error occurred:", event);
          setError("Connection error occurred. Retrying...");
          setIsConnected(false);

          // Close the errored connection
          if (ws.current) {
            ws.current.close();
          }
        };
      } catch (error) {
        console.error("Failed to create WebSocket connection:", error);
        setError("Failed to establish connection. Retrying...");
        setIsConnected(false);
        setIsConnecting(false);

        // Retry connection after a delay
        setTimeout(connectWebSocket, 3000);
      }
    };

    connectWebSocket();

    // Cleanup function
    return () => {
      console.log("Cleaning up WebSocket connection...");
      if (ws.current) {
        ws.current.onclose = null; // Prevent reconnection attempts during cleanup
        ws.current.close();
        setIsConnected(false);
        setIsConnecting(false);
      }
    };
  }, []); // Empty dependency array to only run on mount

  const contextValue: WebSocketContextType = {
    current: ws.current,
    isConnected,
    isConnecting,
    error,
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};
