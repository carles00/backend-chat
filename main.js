var express = require('express');
var http = require('http');
var WebSocketServer = require('websocket').server;

const app = express();

var port = process.argv[3] ? process.argv[3] : 9024;
var webSocketUrl = process.argv[2] ? process.argv[2] : `https://ecv-etic.upf.edu/node/${port}/`



//initialize a simple http server
const server = http.createServer( app );

//initialize the WebSocket server instance
const wss = new WebSocketServer({ httpServer: server });

app.use(express.static('public'));

//to launch
app.listen(port, function () {
	console.log(`Chatter listening on port ${port}`);
});
  