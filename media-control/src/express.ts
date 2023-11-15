import express from "express";
import http from 'http';

const app = express();
process.on('uncaughtException', err => {
    console.error(`Uncaught Exception: ${typeof err}: ${err.message}`);
    console.log(err);
});

app.use(express.json());

export const server = http.createServer(app);
server.listen(8899, () => {
    console.log("Server starter at port:", 8899);
})

export default app;