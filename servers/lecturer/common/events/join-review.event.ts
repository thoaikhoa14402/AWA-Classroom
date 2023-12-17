import { Server, Socket } from "socket.io";
import IEvent from "../interfaces/event";

class JoinReviewEvent implements IEvent {
    public readonly event: string = 'review:join';
    public readonly listener: (io: Server, socket: Socket, ...args: any[]) => void;

    constructor() {
        this.listener = this.onSubscribe;
    }

    private async onSubscribe(io: Server, socket: Socket, message: any) {
        socket.join([...socket.rooms, message.reviewID]);
    }
}

export default new JoinReviewEvent();