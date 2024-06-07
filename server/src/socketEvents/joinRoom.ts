import { Socket } from "socket.io";
import { authorizeJoin } from "../utils/authorizeJoin";
import { Room } from "../models/Room";
import { start } from "repl";
import { startGame } from "./gameLogic/turns";


export function joinRoom(socket: Socket, rooms: Map<string, Room>, socketRooms: Map<string, string>, io: any) {
    socket.on("join_room", (data) => {

        authorizeJoin(rooms, data, socket).then((room: any) => {
            if (!room) return;
            if (room.users.length < 4) {
                console.log(`waiting for ${4 - room.users.length} more players`);
            }
            else {
                room.running = true;
                startGame(room);
                console.log("Game is running");
            }
            socketRooms.set(socket.id, data.room);
            console.log(`Socket ${socket.id} Joined room ${data.room}`);
        });
    });

    socket.on("turn", (socketId) => {
        const roomId = socketRooms.get(socket.id);
        if (!roomId) return;
        const room = rooms.get(roomId);
        if (!room) return;
        room.currentTurn = socket.id;
        room.adminStop = true;
    });
}

export function disconnect(socket: Socket, rooms: Map<string, Room>, socketRooms: Map<string, string>, io: any) {
    socket.on("disconnect", () => {
        const roomId = socketRooms.get(socket.id);
        if (!roomId) return;
        const room = rooms.get(roomId);
        if (!room) return;
        const userIndex = room.users.findIndex((user) => user.id === socket.id);
        room.users.splice(userIndex, 1);
        if (room.users.length < 4) room.running = false;
        if (room.users.length === 0) {
            rooms.delete(roomId);
            console.log(`Room ${roomId} deleted`)

        };
        console.log(`Socket ${socket.id} disconnecting from room ${roomId}`);
        console.log(room)
    });
}