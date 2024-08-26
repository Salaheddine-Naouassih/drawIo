import { Socket } from "socket.io";
import { authorizeJoin } from "../utils/authorizeJoin";
import { Room } from "../models/Room";
import { startGame } from "./gameLogic/turns";


export function joinRoom(socket: Socket, rooms: Map<string, Room>, socketRooms: Map<string, string>, io: any) {
    socket.on("join_room", (data) => {

        authorizeJoin(rooms, data, socket).then((room: any) => {
            if (!room) return;
            if (room.users.length < 2) {
                console.log(`waiting for ${2 - room.users.length} more players`);
            }
            else {
                room.running = true;
                startGame(room, socket, io);
                console.log("Game is running");
            }
            socket.emit("user_count", room.users.length);
            socketRooms.set(socket.id, data.room);
            console.log(`Socket ${socket.id} Joined room ${data.room}`);
            console.log(room)

        });
    });

    socket.on("turn", () => {
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
        
        if (room.users.length == 1) {
            room.users.splice(userIndex, 1);
            rooms.delete(roomId);
            console.log(`Room ${roomId} deleted`)
        }
        else {
            room.users.splice(userIndex, 1);
        }

        
        console.log(`Socket ${socket.id} disconnecting from room ${roomId}`);
        socket.disconnect(true);
    });
}