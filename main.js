var express = require('express');
var http = require('http');
var WebSocketServer = require('websocket').server;

const app = express();

//initialize a simple http server
const server = http.createServer( app );

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ httpServer: server });

app.use(express.static('public'));
