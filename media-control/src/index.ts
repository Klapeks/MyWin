import express from './express/express';
import expressModule from 'express';
import websocket from "./websocket";
import MRouter from "./express/mrouter";
import path from 'path';
import mediaService from './media/media.service';

export const webPath = path.join(__dirname, '../web');
express.app.use(expressModule.static(webPath));
express.app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api')) return next();
    return res.sendFile(webPath+'/index.html');
});

const route = new MRouter();
route.get("/", () => "pong");

async function start() {
    const server = await express.start({
        port: 8899, 
        prefix: "/api",
        routes: {
            "ping": route
        }
    });
    websocket.attach(server);
    mediaService.load();
}

start();