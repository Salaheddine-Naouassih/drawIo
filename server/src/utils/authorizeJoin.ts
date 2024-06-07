import { Socket } from 'socket.io';
import { Room } from '../models/Room';
import { SocketData } from '../models/Data';

export const authorizeJoin = async (rooms: Map<string, Room>, data: SocketData, socket: Socket) => {

    const room = rooms.get(data.room);
    if (!room) {
        socket.emit("error", "Room not found");
        return;
    }
    socket.join(data.room);
    room.users.push({ id: socket.id, roomId: data.room });
    console.log(room)

    return room;
};
