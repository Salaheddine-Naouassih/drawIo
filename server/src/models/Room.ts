import { User } from './User';

export interface Room {
    id: string;
    users: User[];
    running: boolean;
    currentTurn: string;
    adminStop: boolean;
}
