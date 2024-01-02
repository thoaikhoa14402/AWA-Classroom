import io from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
export const socket = io(process.env.REACT_APP_NOTIFY_HOST as string, {
    autoConnect: false,
    transports: ['polling','websocket']
});