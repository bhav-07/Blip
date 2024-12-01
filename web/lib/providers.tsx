"use client";

import { WebSocketProvider } from "@/lib/websocket-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return <WebSocketProvider>{children}</WebSocketProvider>;
}
