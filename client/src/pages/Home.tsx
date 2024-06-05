import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { getConfig } from "../utils/getConfig";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import "./Home.css";

const { SOCKET_URL, SERVER_URL } = getConfig();

enum Color {
  WHITE = "rgb(255, 255, 255)",
  BLACK = "rgb(5, 70, 50)",
}

interface DrawState {
  color: Color;
}

interface Message {
  isUser: boolean;
  message: string;
}

export default function Home() {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [drawState, _] = useState<DrawState>({ color: Color.BLACK });
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const [searchParams] = useSearchParams();
  const roomIdFromSearchParams = searchParams.get("from");

  useEffect(() => {
    if (roomIdFromSearchParams) {
      setRoomId(roomIdFromSearchParams);
    }
  }, [roomIdFromSearchParams]);

  useEffect(() => {
    if (socket) return;
    setSocket(io(SOCKET_URL));
  }, [roomId]);

  const onCreateRoom = () => {
    axios
      .post(`${SERVER_URL}/room`)
      .then((response) => response.data.roomId)
      .then(setRoomId)
      .catch((error) => {
        alert("Something went wrong");
        console.log(error);
      });
  };

  useEffect(() => {
    if (!roomId) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    if (!socket) return;

    let isMouseDown = false;

    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    canvas.addEventListener("mousedown", function (event) {
      isMouseDown = true;
      socket.emit("coordinates", {
        color: drawState.color,
        coordinates: {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        },
        room: roomId,
        event: "mousedown",
      });
    });

    canvas.addEventListener("mousemove", function (event) {
      if (isMouseDown) {
        socket.emit("coordinates", {
          color: drawState.color,
          coordinates: {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
          },
          room: roomId,
          event: "mousemove",
        });
      }
    });
    canvas.addEventListener("mouseup", function () {
      isMouseDown = false;
      socket.emit("coordinates", { event: "mouseup" });
    });

    socket.on("message", (data) => {
      console.log(data);
      setMessages((prev) => [...prev, { isUser: false, message: data }]);
    });

    socket.emit("join_room", { room: roomId });

    socket.on("draw", (data) => {
      ctx.fillStyle = data.color;
      ctx.beginPath();
      ctx.arc(data.coordinates.x, data.coordinates.y, 5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.closePath();
    });
  }, [roomId]);

  const sendMessage = () => {
    const value = messageInputRef.current?.value;
    if (!value) return;
    socket && socket.emit("message", { message: value, room: roomId });
    setMessages((prev) => [...prev, { isUser: true, message: value }]);
    messageInputRef.current!.value = "";
  };

  const switchToEraser = () => {
    drawState.color = Color.WHITE;
  };

  const switchToPen = () => {
    drawState.color = Color.BLACK;
  };

  return roomId ? (
    <>
      <h4>Room ID: {roomId}</h4>
      <div id="parent">
        <div ref={containerRef} id="container">
          <canvas ref={canvasRef} id="canvas">
            Sorry, your browser does not support canvas.
          </canvas>
        </div>
        <div id="chat-container">
          <div id="chat-window">
            {messages.map((message, index) => (
              <div key={index} className={message.isUser ? "user" : "other"}>
                {message.message}
              </div>
            ))}
          </div>
          <div id="msg-ctrl">
            <input
              id="message"
              type="text"
              placeholder="Type your message here"
              ref={messageInputRef}
            ></input>
            <button id="send" onClick={sendMessage}>
              Send
            </button>
          </div>
        </div>
        <button
          id="eraser"
          onClick={switchToEraser}
          style={{
            backgroundColor:
              drawState.color === Color.WHITE ? "black" : "white",
          }}
        >
          Eraser
        </button>
        <button
          onClick={switchToPen}
          style={{
            backgroundColor:
              drawState.color === Color.BLACK ? "black" : "white",
          }}
        >
          Pen
        </button>
      </div>
    </>
  ) : (
    <button onClick={onCreateRoom}>Create room</button>
  );
}
