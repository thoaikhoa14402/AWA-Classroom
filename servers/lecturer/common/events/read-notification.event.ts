import { Server, Socket } from "socket.io";
import IEvent from "../interfaces/event";
import NotificationModel from '../models/notification.model';

class ReadNotificationEvent implements IEvent {
    public readonly event: string = 'read-notification';
    public readonly listener: (io: Server, socket: Socket, ...args: any[]) => void;

    constructor() {
        this.listener = this.onSubscribe;
    }

    private async onSubscribe(io: Server, socket: Socket, message: any) {
        await NotificationModel.findByIdAndUpdate(message.notification_id, { readable: true }, { new: true }).lean();
    }
}

export default new ReadNotificationEvent();