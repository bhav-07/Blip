"use client";

import Container from "@/components/container";
import React, { useState, useContext, useEffect, FormEvent } from "react";
import { WebSocketContext } from "@/lib/websocket-context";
import { useRouter, useSearchParams } from "next/navigation";

type Props = {};

const JoinRoom = (props: Props) => {
  const [roomName, setRoomName] = useState("");
  const [roomJoiningErrorMessage, setRoomJoiningErrorMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const ws = useContext(WebSocketContext);

  const errorMessage = searchParams.get("errorMessage") || "";
  const host = process.env.NEXT_PUBLIC_NGINX_HOST || "localhost";
  const port = process.env.NEXT_PUBLIC_NGINX_PORT || "3000";
  const isLocalEnv = process.env.NEXT_PUBLIC_NGINX_ENV === "local";

  const endpoint = isLocalEnv ? `ws://${host}:${port}` : `wss://${host}`;
  useEffect(() => {
    if (!ws?.current || ws.current.readyState !== WebSocket.OPEN) {
      if (ws) {
        ws.current = new WebSocket(`ws://localhost:8080/ws/chat`);

        ws.current.onopen = () => console.log("WebSocket reconnected");

        ws.current.onerror = (error) => {
          console.error("WebSocket error:", error);
          router.push("/login");
        };
      }
    }

    const handleMessage = (message: any) => {
      console.log("Message received from server: ", message.data);
      const data = JSON.parse(message.data);
      if (data.type === "join_room" && data.success) {
        console.log(`Redirecting to /chat?roomName=${roomName}`);
        router.push(`/chat?roomName=${roomName}`);
      }
    };

    if (ws?.current) {
      ws.current.addEventListener("message", handleMessage);
    }

    return () => {
      if (ws?.current) {
        ws.current.removeEventListener("message", handleMessage);
      }
    };
  }, [ws, roomName, router, endpoint]);

  const handleJoin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (roomName === "") {
      setRoomJoiningErrorMessage("Why the hurry? Enter a room name first!");
      return;
    }
    const currentWebSocket = ws?.current;

    if (currentWebSocket && currentWebSocket.readyState === WebSocket.OPEN) {
      currentWebSocket.send(
        JSON.stringify({ type: "join_room", room: roomName })
      );
    } else {
      console.error("WebSocket is not open. Attempting to reconnect...");
      const token = localStorage.getItem("token");
      if (token && ws) {
        ws.current = new WebSocket(`${endpoint}/ws/chat?token=${token}`);
      } else {
        router.push("/login");
      }
    }
  };

  let errorMessageToDisplay = null;
  if (roomJoiningErrorMessage) {
    errorMessageToDisplay = (
      <span className="error-message">*{roomJoiningErrorMessage}</span>
    );
  } else if (errorMessage) {
    errorMessageToDisplay = (
      <span className="error-message">*{errorMessage}</span>
    );
  }

  return (
    <Container className="text-white">
      <form onSubmit={handleJoin} className="space-y-4">
        <div className="text-3xl font-bold">Join a Room</div>
        <span className="text-neutral-400">
          Where will your words take you today? 🤔
        </span>
        {errorMessageToDisplay}
        <br />
        <div>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Enter Chat Room Name"
            className="p-3 rounded-md text-black"
          />
        </div>
        <button className="bg-black rounded-md p-3">Join Room 🚀</button>
      </form>
    </Container>
  );
};

export default JoinRoom;
