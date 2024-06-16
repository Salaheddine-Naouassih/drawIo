import http from "http";
import express from "express";
import * as socketIo from "socket.io";
import { v4 } from "uuid";
import cors from "cors";
import { Room } from "./models/Room";
import { joinRoom, disconnect } from "./socketEvents/joinRoom";
import draw from "./socketEvents/drawing";
import message from "./socketEvents/messages";

export function startServer() {
  const app = express();
  const server = http.createServer(app);
  const io = new socketIo.Server(server, { cors: { origin: "*" } });

  app.use(cors());
  const rooms = new Map<string, Room>();
  const socketRooms = new Map<string, string>();

  io.on("connection", (socket) => {
    joinRoom(socket, rooms, socketRooms, io);
    disconnect(socket, rooms, socketRooms, io);
    draw(io, socket, rooms);
    message(io, socket, rooms);
  });


  app.post("/room", (_, res) => {
    const roomId = v4();
    rooms.set(roomId, {
      id: roomId,
      users: [],
      running: false,
      currentTurn: "",
      adminStop: false,
    });
    res.json({ roomId });
  });

  app.get("/:roomId", (req, res) => {
    const roomId = req.params.roomId;
    res.redirect(`http://localhost:5173/${roomId}`);
  });

  return { server, app };
}
