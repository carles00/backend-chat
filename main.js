const express = require('express');
const http = require('http');
const WebSocketServer = require('websocket').server;
const bodyParser = require('body-parser');
const redis = require('redis');
const assert = require('assert');
const { url } = require('inspector');

const app = express();

const server = http.createServer(app);
const wss = new WebSocketServer({ httpServer:server });
const port = process.argv[2] ? process.argv[2] : 9024

module.exports = redis.createClient({
  host: '127.0.0.1',
  port: 6379
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:true }));

app.use(express.static('public'))
// Creating connection using websocket
wss.on("request", function(request){
	
 	console.log("new client connected")
})

app.post('/register', (req, res) => {
	console.log(req.body)
	// TODO: check if username is in DB
	// Save username, password, skin and room
	req.body.forEach()
	redis.put('key', 'value', err => {
		if (err) console.error(`Error putting key: ${err}`)
		else console.log('Key saved successfully!')
	})
	// res.sendStatus(200)
})

app.post("/login",function(req, res){
	console.log(req.body)
	let body = req.body;
	//TODO validate
	//TODO buscar el nom de la room del user
	let roomName = 'userRoom';
	res.redirect(`./chat.html?${body['username']}&${roomName}`) //TODO posar user i room
});

server.listen(port, function(){
	console.log(`HTTP listening on port ${port}`)
	console.log(`WebSocketServer listening on url:${port}/ws`)
})
