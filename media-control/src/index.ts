import express from './express/express';
import websocket from "./websocket";
import MRouter from "./express/mrouter";

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
}

start();