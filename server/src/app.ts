import http from "http";
import express from "express";
import * as socketIo from "socket.io";
import { v4 } from "uuid";
import cors from "cors";

export function startServer() {
  const app = express();
  const server = http.createServer(app);
  const io = new socketIo.Server(server, { cors: { origin: "*" } });

  app.use(cors());

  io.on("connection", (socket) => {
    socket.on("join_room", (data) => {
      console.log("Joining room", data.room);
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
  });

  app.post("/room", (_, res) => {
    const roomId = v4();
    res.json({ roomId });
  });

   app.get("/:roomId", (req, res) => {
     const roomId = req.params.roomId;
     res.redirect(`http://localhost:5173/path?roomId=${roomId}`);
   });

  return { server, app };
}
