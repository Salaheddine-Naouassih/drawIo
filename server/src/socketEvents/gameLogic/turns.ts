import { Socket } from "socket.io";
import { Room } from "../../models/Room";
import { User } from "../../models/User";


const words = ["hello", "morning", "night", "evening"];


export const startGame = async (room: Room, socket: Socket, io: any) => {
    const points = new Map<User, number>();
    room.users.forEach((user: any) => {
        points.set(user.id, 0);
    });
    const rounds = 2;
    for (let i = 0; i < rounds; i++) {
        console.log("Round: ", i + 1)
        await setTurns(room, socket, io);
    }
    setTimeout(() => {
        io.to(room.id).emit("next_round",);

    },
        3000);
}

async function setTurns(room: Room, socket: Socket, io: any) {
    const turns: string[] = room.users.map(user => user.id);

    return new Promise<void>((resolve) => {
        const turn = () => {
            if (turns.length === 0 || room.adminStop === true) {
                clearInterval(interval);
                console.log("Game Over");
                resolve();
                return;
            }

            room.currentTurn = turns.pop() as string;
            const word = fetchWord();
            room.currentWord = word;
            io.to(room.id).emit("wordLength", word.length);
            socket.to(room.currentTurn).emit("yourTurn", { word });
            console.log("currentTurn: ", room.currentTurn)
            console.log("currentWord: ", room.currentWord)
        };

        const interval = setInterval(turn, 20000);
        turn(); // Call immediately to start the first turn
    });
}


function fetchWord() {

    let rand = Math.floor(Math.random() * 10) % words.length;
    return words[rand];
}

