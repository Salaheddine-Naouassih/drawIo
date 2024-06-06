import http from "http";
import express from "express";
import * as socketIo from "socket.io";
import { v4 } from "uuid";
import cors from "cors";
import { Interface } from "readline";
import { Room } from "./models/Room";
import { authorizeJoin } from "./utils/authorizeJoin";

export function startServer() {
  const app = express();
  const server = http.createServer(app);
  const io = new socketIo.Server(server, { cors: { origin: "*" } });

  app.use(cors());


  let rooms: Room[] = [];
  io.on("connection", (socket) => {
    socket.on("join_room", (data) => {
      authorizeJoin(rooms, data, socket);
      console.log(`Socket ${socket.id} Joining room ${data.room}`);
      socket.join(data.room);
    });

    socket.on("coordinates", (data) => {
      try {
        io.to(data.room).emit("draw", data);
      } catch (e) {
        console.log(e);
      }
    });

    socket.on("message", (data) => {
      io.to(data.room).emit("message", data.message);
    });

    socket.on("disconnect", () => {
      const room = rooms.find((room) => room.users.find((user) => user.id === socket.id));
      if (!room) return;
      const userIndex = room.users.findIndex((user) => user.id === socket.id);
      room.users.splice(userIndex, 1);
      console.log(`Socket ${socket.id} disconnected from room ${room.id}`);
    });
  });

  app.post("/room", (_, res) => {
    const roomId = v4();
    rooms.push({ id: roomId, users: [] });
    res.json({ roomId });
  });

  app.get("/:roomId", (req, res) => {
    const roomId = req.params.roomId;
    res.redirect(`http://localhost:5173/path?roomId=${roomId}`);
  });

  return { server, app };
}
