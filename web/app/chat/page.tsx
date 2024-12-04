"use client";

import React, { useState, useEffect, useContext, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { WebSocketContext } from "@/lib/websocket-context";
import { cn } from "@/lib/utils";

interface Message {
  id?: string;
  type?: "chat_message" | "join_room";
  sender: string;
  senderName: string;
  content: string;
  server?: string;
}

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 3000;

const ChatRoom: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const roomName = searchParams.get("roomName") || "";
  const ws = useContext(WebSocketContext);

  const userID =
    typeof window !== "undefined" ? localStorage.getItem("go-chat-userId") : "";

  // Handle WebSocket reconnection
  const attemptReconnect = useCallback(() => {
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      setConnectionError("Unable to connect to chat. Please try again later.");
      router.push(
        `/joinroom?error=${encodeURIComponent(
          "Connection failed. Please try again."
        )}`
      );
      return;
    }

    if (ws?.current) {
      ws.current = new WebSocket("ws://localhost:8080/ws/chat");
      setReconnectAttempts((prev) => prev + 1);

      // Re-join the room after reconnection
      ws.current.addEventListener("open", () => {
        ws.current?.send(
          JSON.stringify({
            type: "join_room",
            room: roomName,
          })
        );
        setIsConnected(true);
        setConnectionError(null);
        setReconnectAttempts(0);
      });
    }
  }, [reconnectAttempts, roomName, router, ws]);

  useEffect(() => {
    if (!roomName) {
      router.push("/joinroom");
      return;
    }

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest(".emoji-picker") &&
        !target.closest(".toggle-emoji-picker")
      ) {
        setShowPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    const currentWebSocket = ws?.current;

    const handleOpen = () => {
      setIsConnected(true);
      setConnectionError(null);
      // Join room when connection is established
      currentWebSocket?.send(
        JSON.stringify({
          type: "join_room",
          room: roomName,
        })
      );
    };

    const handleMessage = (message: MessageEvent) => {
      try {
        const data = JSON.parse(message.data);
        setMessages((prevMessages) => [...prevMessages, data]);
      } catch (error) {
        console.error("Failed to parse message:", error);
      }
    };

    const handleClose = () => {
      setIsConnected(false);
      setTimeout(attemptReconnect, RECONNECT_INTERVAL);
    };

    const handleError = () => {
      setIsConnected(false);
      setConnectionError("Connection error occurred");
    };

    if (currentWebSocket) {
      currentWebSocket.addEventListener("open", handleOpen);
      currentWebSocket.addEventListener("message", handleMessage);
      currentWebSocket.addEventListener("close", handleClose);
      currentWebSocket.addEventListener("error", handleError);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (currentWebSocket) {
        currentWebSocket.removeEventListener("open", handleOpen);
        currentWebSocket.removeEventListener("message", handleMessage);
        currentWebSocket.removeEventListener("close", handleClose);
        currentWebSocket.removeEventListener("error", handleError);
      }
    };
  }, [roomName, ws, router, attemptReconnect]);

  const sendMessage = useCallback(() => {
    if (input.trim() !== "" && ws?.current?.readyState === WebSocket.OPEN) {
      try {
        ws.current.send(
          JSON.stringify({
            type: "chat_message",
            room: roomName,
            content: input,
          })
        );
        setInput("");
      } catch (error) {
        setConnectionError("Failed to send message. Please try again.");
      }
    }
  }, [input, roomName, ws]);

  const leaveRoom = useCallback(() => {
    if (ws?.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: "leave_room", room: roomName }));
    }
    router.push("/joinroom");
  }, [roomName, router, ws]);

  // Rest of your component code remains the same
  const handleEmojiPickerToggle = () => setShowPicker(!showPicker);
  const addEmoji = (emoji: any) => setInput(input + emoji.native);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="w-full max-w-4xl h-[85vh] p-6 rounded-xl bg-background/80 backdrop-blur-sm border border-border/50 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-semibold">{roomName}</h3>
          {!isConnected && (
            <span className="text-destructive text-sm">
              Reconnecting{".".repeat(reconnectAttempts % 4)}
            </span>
          )}
        </div>
        <button
          onClick={leaveRoom}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md transition-colors"
        >
          Leave Room
        </button>
      </div>

      {connectionError && (
        <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md mb-4">
          {connectionError}
        </div>
      )}

      {/* Messages section remains the same */}
      <div className="h-[calc(100%-8rem)] overflow-y-auto rounded-lg bg-background/50 border border-border/50 p-4">
        {messages.map((msg, index) => {
          const isJoiningMessage = msg.type === "join_room";
          const isOwnMessage = msg.sender === userID;

          if (isJoiningMessage) {
            return (
              <div
                key={msg.id || index}
                className="text-center text-muted-foreground my-3 whitespace-nowrap"
              >
                {isOwnMessage
                  ? `You joined ${roomName} 🎉`
                  : `${msg.senderName} joined from server ${msg.server} 🎉`}
              </div>
            );
          }

          return (
            <div
              key={msg.id || index}
              className={cn(
                "flex flex-col max-w-[80%] mb-4 p-3 rounded-2xl animate-in fade-in slide-in-from-bottom-3 duration-200",
                isOwnMessage
                  ? "ml-auto bg-primary text-primary-foreground rounded-tr-none"
                  : "bg-muted text-foreground rounded-tl-none"
              )}
            >
              <div className="flex justify-between mb-1 text-sm">
                {!isOwnMessage && (
                  <span className="font-medium text-primary">
                    {msg.senderName}
                  </span>
                )}
              </div>
              <div className="break-words">{msg.content}</div>
              <div className="self-end text-xs mt-2 opacity-70">
                {new Date().toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 mt-4">
        <button
          onClick={handleEmojiPickerToggle}
          className="text-xl hover:text-2xl transition-all p-2"
          disabled={!isConnected}
        >
          😃
        </button>
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 p-3 rounded-md bg-background border border-input focus:border-primary 
            focus:ring-1 focus:ring-primary focus:outline-none resize-none"
          placeholder={
            isConnected ? "What's on your mind?" : "Reconnecting to chat..."
          }
          disabled={!isConnected}
        />
        <button
          onClick={sendMessage}
          disabled={!isConnected}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 
            rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
        {showPicker && (
          <div className="absolute bottom-full left-0 z-50 rounded-lg overflow-hidden shadow-lg">
            <Picker data={data} onEmojiSelect={addEmoji} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatRoom;
