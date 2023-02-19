/****************************/
/* === CommonJS MODULES === */
/****************************/
const http = require('http')
const redis = require('redis')
const express = require('express')
const bodyParser = require('body-parser')
const WebSocketServer = require('websocket').server

class Message{
	constructor(type, content, userName){
		this.type = type;
		this.content = content;
		this.userName = userName;
	}
}
class Client{
	constructor(connection, id, roomName){
		this.connection = connection;
		this.userId = id;
		this.room = roomName;
	}
}

class Room{
	constructor(room){
		this.name = room;
		this.clientsConnected = [];
		this.url = null;
	}

	addClient(clientID) {
		this.clientsConnected.push(clientID);
	}
}

var chat = {
	roomsByName: {},
	clinetsById: {},
	clients: [],

	addRoom: function(room) {
		this.roomsByName[room.name] = room;
	},
	
	addClinet: function(client, roomName){
		let room = this.roomsByName[roomName];
		this.clinetsById[client.userId] = client
		this.clients.push(client);
		room.addClient(client.userId);
	},

	roomMessages: function(msg){
		let userName = msg.userName;
		let userId = msg.userId;
		let content = msg.content;

		let roomName = chat.clinetsById[userId].room;
		let room = chat.roomsByName[roomName];
		room.clientsConnected.forEach(client => {
			if(client !== userId){
				let clientToSend = chat.clinetsById[client];
				let sysMessage = new Message(msg.type, content, userName);
				clientToSend.connection.sendUTF(JSON.stringify(sysMessage))
			}
		});
	}
}


/****************************/
/* === GLOBAL VARIABLES === */
/****************************/
const app = express()
const server = http.createServer(app)
const wss = new WebSocketServer({ httpServer:server })
const port = process.argv[2] ? process.argv[2] : 9024
const redisPrefix = ''
const redisClient = redis.createClient({
  host: '127.0.0.1',
  port: 6379
})


/**************************/
/* === EXPRESS CONFIG === */
/**************************/
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended:true }))
app.use(express.static('public'))
/**************************/
/* === WebSocket Func === */
/**************************/


let userID = 0
let roomID = 0

wss.on('request', req => {
	userID++;
	
	let roomName = req.resource.split('/').pop()
	let connection = req.accept();
	
	if(!chat.roomsByName[roomName]){
		let newRoom = new Room(roomName);
		chat.addRoom(newRoom);
	}
	let newClient = new Client(connection, userID, roomName);
	chat.addClinet(newClient, roomName);
	
	//send id to the user
	connection.sendUTF(JSON.stringify(new Message("id",userID)));

	connection.on('message', function(message){
		let msg = JSON.parse(message.utf8Data);
		switch(msg.type){
			case "text":
			case "join":
				chat.roomMessages(msg);
				break;
			case "get_room_asset":
				//console.log(message.utf8Data);
				//TODO get asset name from database
				//let assetMessage = new Message('room_asset', "assets/room1.png", userID);
				//connection.sendUTF(JSON.stringify(assetMessage));
				break;
			default:
				break;
		}
	})
});  


/********************/
/* === REGISTER === */
/********************/
app.post('/register', async (req, res) => {
	const key = `${redisPrefix}.${req.body.username}`
	// Check if key exists.
	await redisClient.exists(key, async (err, reply) => {
		if (err) console.error(`Error checking key: ${err}`)
		// If already registered, redirect directly to login.
		else if (reply === 1) {
			res.redirect('./index.html')
		}
		// If not, add the key-value pair to the DB and redirect to login.
		else {
			const value = JSON.stringify(req.body)
			await redisClient.put(key, value, err => {
				if (err) console.error(`Error putting key: ${err}`)
			})
		}
	})
})


/*****************/
/* === LOGIN === */
/*****************/
app.post('/login', async (req, res) => {
	const key = `${redisPrefix}.${req.body.username}`
	// Check if key exists.
	await redisClient.exists(key, async (err, reply) => {
		if (err) console.error(`Error checking key: ${err}`)
		// If already registered, get the user info and redirect to chat.
		else if (reply === 1) {
			await redisClient.get(key, (err, value) => {
				if (err) console.error(`Error getting key: ${err}`)
				else {
					const userInfo = JSON.parse(value)
					res.redirect(`./chat.html?username=${userInfo.username}&roomname=${userInfo.room}`)
				}
			})
		}
		// If not, bad credentials.
		else console.log('Key not found')
	})
	
})


/****************************/
/* === SERVER LISTENING === */
/****************************/
server.listen(port, () => {
	console.log(`HTTP listening on port ${port}`)
	console.log(`WebSocketServer listening on url:${port}/ws`)
})
