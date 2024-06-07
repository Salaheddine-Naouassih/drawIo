import { Socket } from "socket.io";
import { Room } from "../../models/Room";
import { User } from "../../models/User";

export const startGame = (room: Room) => {

    const points = new Map<User, number>();
    room.users.forEach((user: any) => {
        points.set(user.id, 0);
    });
    const rounds = 3;
    for (let i = 0; i < rounds; i++) {
        setTurn(room);
    }


}


function setTurn(room: Room) {

    const turns: string[] = [];

    for (let i = 0; i < room.users.length; i++) {
        turns.push(room.users[i].id);
    }
    setInterval(() => {
        if (turns.length !== 0) {
            if (room.adminStop !== true) {
                room.currentTurn = turns.pop() as string;
                console.log(room.currentTurn);
            }
        }
    }, 20000);
}



