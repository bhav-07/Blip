"use client";

import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
  Suspense,
} from "react";
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

const Loading = () => {
  return (
    <div className="bg-container">
      <div className="chat-room">
        <div className="chat-room-header">
          <h3 className="text-xl font-semibold">Loading chat room...</h3>
        </div>
      </div>
    </div>
  );
};

const ChatRoomContent: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [userID, setUserID] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const roomName = searchParams.get("roomName") || "";
  const ws = useContext(WebSocketContext);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const messageWithLineBreaks = (message: string) => {
    return message.split("\n").map((line, index, array) =>
      index === array.length - 1 ? (
        line
      ) : (
        <React.Fragment key={index}>
          {line}
          <br />
        </React.Fragment>
      )
    );
  };

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

      ws.current.addEventListener("open", () => {
        ws.current?.send(JSON.stringify({ type: "join_room", room: roomName }));
        setIsConnected(true);
        setConnectionError(null);
        setReconnectAttempts(0);
      });
    }
  }, [reconnectAttempts, roomName, router, ws]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserID(localStorage.getItem("go-chat-userId") || "");
    }

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

    if (currentWebSocket?.readyState === WebSocket.OPEN) {
      currentWebSocket.send(
        JSON.stringify({ type: "join_room", room: roomName })
      );
    }

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

    if (currentWebSocket) {
      currentWebSocket.addEventListener("message", handleMessage);
      currentWebSocket.addEventListener("close", handleClose);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (currentWebSocket) {
        currentWebSocket.removeEventListener("message", handleMessage);
        currentWebSocket.removeEventListener("close", handleClose);
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

  const handleEmojiPickerToggle = () => setShowPicker(!showPicker);
  const addEmoji = (emoji: any) => setInput(input + emoji.native);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="bg-container">
      <div className="chat-room">
        <div className="chat-room-header">
          <h3 className="text-xl font-semibold">{roomName}</h3>
          {!isConnected && (
            <span className="text-destructive text-sm">
              Reconnecting{".".repeat(reconnectAttempts % 4)}
            </span>
          )}
          <button className="leave-room-button" onClick={leaveRoom}>
            Leave Room
          </button>
        </div>

        {connectionError && (
          <div className="error-message">{connectionError}</div>
        )}

        <div className="message-box" ref={chatContainerRef}>
          {messages.map((msg, index) => {
            const isJoiningMessage = msg.type === "join_room";
            const isOwnMessage = msg.sender === userID;

            if (isJoiningMessage) {
              return (
                <div key={msg.id || index} className="join-message">
                  {isOwnMessage
                    ? `You joined ${roomName} 🎉`
                    : `${msg.senderName} joined from server ${msg.server} 🎉`}
                </div>
              );
            }

            return (
              <div
                key={msg.id || index}
                className={cn("message", isOwnMessage ? "own-message" : "")}
              >
                <div className="message-header">
                  {!isOwnMessage && (
                    <span className="sender-name">{msg.senderName}</span>
                  )}
                </div>
                <div className="message-content">
                  {messageWithLineBreaks(msg.content)}
                </div>
                <div className="message-footer">
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

        <div className="chat-room-footer">
          <button
            onClick={handleEmojiPickerToggle}
            className="toggle-emoji-picker"
            disabled={!isConnected}
          >
            😃
          </button>
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="message-input"
            placeholder={
              isConnected ? "What's on your mind?" : "Reconnecting to chat..."
            }
            disabled={!isConnected}
          />
          <button
            onClick={sendMessage}
            disabled={!isConnected}
            className="send-message-button"
          >
            Send
          </button>
          {showPicker && (
            <div className="emoji-picker">
              <Picker data={data} onEmojiSelect={addEmoji} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ChatRoom: React.FC = () => {
  return (
    <Suspense fallback={<Loading />}>
      <ChatRoomContent />
    </Suspense>
  );
};

export default ChatRoom;
