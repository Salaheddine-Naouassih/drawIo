import { User } from './User';

export interface Room {
    id: string;
    name?: string;
    capacity?: number;
    createdAt?: Date;
    users: User[];
}
