import { Server, Socket } from "socket.io";
import http from 'http';
import mediaService from './media/media.service';

const websocket = new Server(undefined as any as http.Server);

websocket.on('connection', (socket) => {
    const authType = socket.handshake.auth?.type;
    if (authType == 'klapeks-win') {
        socket.join('klapeks-win');
    }
    socket.on('media:pause', () => {
        mediaService.pause();
    });
    socket.on('media:resume', () => {
        mediaService.resume();
    });
    socket.on('media:next', () => {
        mediaService.next();
    });
    socket.on('media:prev', () => {
        mediaService.prev();
    });
    mediaService.onSocketJoin();
})

export default websocket;