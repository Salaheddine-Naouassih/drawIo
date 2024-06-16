import { Socket } from "socket.io";
import { Room } from "../models/Room";

export default function draw(io: any, socket: Socket, rooms: Map<string, Room>) {

    socket.on("draw", (data) => {
        try {
            const room = rooms.get(data.room);
            if (!room) return console.log("on draw error", data.room);
            if (room?.running === false) return console.log("Game is not running");
            if (socket.id == room.currentTurn) {
                io.to(data.room).emit("draw", data);
            }
        } catch (e) {
            console.log(e);
        }
    });
}
