export interface DrawingData {
    coordinates: {
        x: number;
        y: number;
    };
    color: string;
    thickness: number;
    event: string;
}


export interface SocketData {
    id: string;
    message: string;
    timestamp: number;
    room: string;
    drawing: DrawingData;
}
