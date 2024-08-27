import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { getConfig } from "../utils/getConfig";
import axios from "axios";
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
  const [userCount, setUserCount] = useState<number>(0)
  const [wordLength, setWordLength] = useState<number>();
  const [word, setWord] = useState<string>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const roomIdFromSearchParams = window.location.pathname.slice(1);
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
    if (socket) {
      axios
        .post(`${SERVER_URL}/room`)
        .then((response) => {
          setRoomId(response.data.roomId);
        })
        .catch((error) => {
          alert("Something went wrong" + error.message.toString());
          console.log(error);
        });

    }
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

    socket.emit("join_room", { room: roomId });

    socket.on("user_count", (data) => {
      setUserCount(data);
    });



    socket.on("error", (error) => {
      if (error === "Room not found") {
        setRoomId(null);
        alert("Room not found");
      }
      else {
        alert("Something went wrong :" + error.message);

      }
    });

    canvas.addEventListener("mousedown", function (event) {
      isMouseDown = true;
      socket.emit("draw", {
        color: drawState.color,
        coordinates: {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        },
        room: roomId,
        event: "mousedown",
        thickness: 5,
      });
    });

    canvas.addEventListener("mousemove", function (event) {
      if (isMouseDown) {
        socket.emit("draw", {
          color: drawState.color,
          coordinates: {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
          },
          room: roomId,
          event: "mousemove",
          thickness: 5,

        });
      }
    });
    canvas.addEventListener("mouseup", function () {
      isMouseDown = false;
      socket.emit("draw", { event: "mouseup", room: roomId });
    });

    socket.on("yourTurn", (data) => {
      setWord(data.word);
    });

    socket.on("wordLength", (data) => {
      setWordLength(data);
    });



    socket.on("message", (data) => {
      console.log(data);
      setMessages((prev) => [...prev, { isUser: false, message: data }]);
    });

    socket.on("draw", (data) => {
       ctx.fillStyle = data.color;
       ctx.beginPath();
       ctx.arc(data.coordinates.x, data.coordinates.y, 5, 0, 2 * Math.PI);
       ctx.fill();
       ctx.closePath();


      //let x = data.coordinates.x;
      //let y = data.coordinates.y;
      //// Get the current image data
      //let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      //// Calculate the index of the pixel
      //let index = (x + y * imageData.width) * 4;
      //let thickness = Math.round(data.thickness as number);
      //let dataimage = ctx.createImageData(thickness, thickness);
      //for (let i = 0; i < dataimage.data.length; i += 4) {
      //  dataimage.data[i + 0] = 0; // R value
      //  dataimage.data[i + 1] = 0; // G value
      //  dataimage.data[i + 2] = 0; // B value
      //  dataimage.data[i + 3] = 255; // A value
      //}
      //// Parse the color from data.color (assumed to be in the format "rgb(r, g, b)")
      //let [r, g, b] = data.color.match(/\d+/g);
//
//
//
      //// Set the pixel color
      //imageData.data[index + 0] = r; // Red
      //imageData.data[index + 1] = g; // Green
      //imageData.data[index + 2] = b; // Blue
      //imageData.data[index + 3] = 255; // Alpha (255 = fully opaqu
      //// Put the image data back onto the canvas
      //ctx.putImageData(dataimage, x, y);
      //console.log(data.color);
      
    });
  }, [roomId]);

  const sendMessage = () => {
    const value = messageInputRef.current?.value;
    if (!value) return;
    socket && socket.emit("message", { message: value, room: roomId });
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
      <h4> localhost:5173/{roomId}</h4>
      {/* waiting for x players */}
      {userCount < 2 ? <h3>Waiting for {2 - userCount} more players</h3> : <h3>Game is running</h3>}
      {wordLength ? <h3>Word length: {wordLength}</h3> : null}
      {word ? <h3>Word: {word}</h3> : null}
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
        <button className="ui button" onClick={() => (socket?.emit("turn", socket.id))}>ÜRESSS HEERE</button>
      </div>
    </>
  ) : (
    //on document load, parse url for roomId

    <button onClick={onCreateRoom}>Create room</button>
  );
}
