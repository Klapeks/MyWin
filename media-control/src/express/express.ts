import express from "express";
import { AddressInfo } from "net";
import { env } from "process";
import afterInit from "./after.init";
import cookieParser from "./cookie.parser";
import registerRoutes from "./register.routes";
import http from 'http';

const app = express();

const showErrors = (env.SHOW_DATABASE_ERRORS_IN_FRONEND?.toString())?.toLowerCase() === "true";

process.on('uncaughtException', err => {
    console.error(`Uncaught Exception: ${typeof err}: ${err.message}`);
    console.error(err);
});

export default {
    app,
    async start(options: {
        port: number,
        prefix?: string,
        routes: { [path: string]: any }
    }) {
        app.use(express.json());
        app.use(cookieParser);
        
        await registerRoutes(app, options.prefix, options.routes);

        afterInit(app, showErrors);
        
        const server = http.createServer(app);
        server.listen(options.port, () => {
            if (!options.port) console.log("No default port at .env was founded. Using random...");
            console.log("Server starter at port:", (server.address() as AddressInfo).port);
        })
        return server;
    }
};