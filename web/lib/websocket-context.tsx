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
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reconnectAttempts = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;

  const connectWebSocket = () => {
    if (
      isConnecting ||
      (ws.current && ws.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    const env = process.env.NEXT_PUBLIC_NGINX_ENV || "local";
    const host = process.env.NEXT_PUBLIC_NGINX_HOST || "localhost";
    const port = process.env.NEXT_PUBLIC_NGINX_PORT || "8080";

    const serverUrl =
      env === "local"
        ? `ws://${host}:${port}/ws/chat`
        : `wss://${host}/ws/chat`;

    try {
      // Clear existing connection if any
      if (ws.current) {
        ws.current.close();
      }

      setIsConnecting(true);
      setError(null);

      ws.current = new WebSocket(serverUrl);

      ws.current.onopen = () => {
        console.log("WebSocket connected successfully");
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
        reconnectAttempts.current = 0;
      };

      ws.current.onclose = (event) => {
        console.log("WebSocket connection closed:", event.code, event.reason);
        setIsConnected(false);
        setIsConnecting(false);

        // Only attempt to reconnect if we haven't exceeded the maximum attempts
        if (
          event.code !== 1000 &&
          event.code !== 1001 &&
          reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS
        ) {
          reconnectAttempts.current += 1;
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttempts.current),
            10000
          );
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, delay);
        } else if (reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) {
          setError(
            "Maximum reconnection attempts reached. Please refresh the page."
          );
        }
      };

      ws.current.onerror = (event) => {
        console.error("WebSocket error occurred:", event);
        setError("Connection error occurred. Retrying...");
        setIsConnected(false);

        if (ws.current) {
          ws.current.close();
        }
      };
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      setError("Failed to establish connection. Retrying...");
      setIsConnected(false);
      setIsConnecting(false);

      if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts.current += 1;
        const delay = Math.min(
          1000 * Math.pow(2, reconnectAttempts.current),
          10000
        );
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, delay);
      }
    }
  };

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (ws.current) {
        ws.current.onclose = null; // Prevent reconnection attempts during cleanup
        ws.current.close();
      }
      setIsConnected(false);
      setIsConnecting(false);
    };
  }, []);

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
