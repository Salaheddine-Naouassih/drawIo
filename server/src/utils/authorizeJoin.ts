import { Socket } from 'socket.io';
import { Room } from '../models/Room';
import { SocketData } from '../models/Data';

export const authorizeJoin = async (rooms: Room[], data: SocketData, socket: Socket) => {
    const room = rooms.find((room) => room.id === data.room);
    console.log(rooms);
    if (!room) {
        socket.emit("error", "Room not found");
        return;
    }
    room.users.push({ id: socket.id, roomId: data.room });
};
