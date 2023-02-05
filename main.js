const express = require('express');
const http = require('http');
const WebSocketServer = require('ws');

const app = express();

const server = http.createServer(app);
 
const wss = new WebSocketServer.Server({ server:server, path:"/ws"});
 
const PORT = process.argv[2] ? process.argv[2] : 9024;

app.use(express.static('public'));
// Creating connection using websocket
wss.on("connection", ws => {
    console.log("new client connected");
 
    // sending message to client
    ws.send('Welcome, you are connected!');
 
    //on message from client
    ws.on("message", data => {
        console.log(`Client has sent us: ${data}`)
    });
 
    // handling what to do when clients disconnects from server
    ws.on("close", () => {
        console.log("the client has disconnected");
    });
    // handling client connection error
    ws.onerror = function () {
        console.log("Some Error occurred")
    }
});

server.listen(PORT, function(){
	console.log(`HTTP listening on port ${PORT}`);
	console.log(`WebSocketServer listening on url:${PORT}/ws`);
})