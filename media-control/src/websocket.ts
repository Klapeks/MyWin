import { Server, Socket } from "socket.io";
import http from 'http';

const websocket = new Server(undefined as any as http.Server);

websocket.on('connection', (socket) => {
    const authType = socket.handshake.auth?.type;
    if (authType == 'klapeks-win') {
        socket.join('klapeks-win');
    }
})


export default websocket