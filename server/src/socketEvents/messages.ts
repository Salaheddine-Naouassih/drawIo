import { Socket } from "socket.io";
import { Room } from "../models/Room";

export default function message(io: any, socket: Socket, rooms: Map<string, Room>) {
    socket.on("message", (data) => {
        io.to(data.room).emit("message", data.message);
    });
}