/****************************/
/* === CommonJS MODULES === */
/****************************/
const http = require('http')
const redis = require('redis')
const express = require('express')
const bodyParser = require('body-parser')
const WebSocketServer = require('websocket').server;
const serverRooms = require('./serverRooms')

/****************************/
/* === GLOBAL VARIABLES === */
/****************************/
const app = express()
const server = http.createServer(app)
const wss = new WebSocketServer({ httpServer:server })
const port = process.argv[2] ? process.argv[2] : 9024
const redisPrefix = 'ECDWYC'
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
serverRooms.init();

let userId = 0

wss.on('request', req => {
	userId++;
	
	let roomName = req.resource.split('/').pop()
	let connection = req.accept();

	serverRooms.onUserConnected(connection, roomName, userId);
	
	connection.on('message', function(message){
		let msg = JSON.parse(message.utf8Data);
		switch(msg.type){
			case "text":
				serverRooms.roomMessages(msg)
				break
			case "join":
				serverRooms.joinRoom(msg, redisPrefix, redisClient)
				break
			case "send-update":
				serverRooms.sendUpdate(msg)
				break
			case "get_room_asset":
				// console.log(message.utf8Data)
				// TODO: get asset name from database
				// let assetMessage = new Message('room_asset', "assets/room1.png", userID)
				// connection.sendUTF(JSON.stringify(assetMessage))
				break
			default: break
		}
	})

	connection.on('close', () => serverRooms.onUserDisconnected(connection))
})


/********************/
/* === REGISTER === */
/********************/
app.post('/register', async (req, res) => {
	// Sanitize username (delete '.')
	req.body.username = req.body.username.replace(/\./g, '')
	// Open connection to DB
	await redisClient.connect()
	// Check if requested user is already registered
	const key = `${redisPrefix}.${req.body.username}`
	if (await redisClient.get(key) === null) {
		await redisClient.set(key, JSON.stringify(req.body))
		await redisClient.disconnect()
		res.send('<script>alert("User registered successfully :)"); window.location.href = "/"</script>')
	}
	else {
		await redisClient.disconnect()
		res.send('<script>alert("User already registered :/"); window.location.href = "/register.html"</script>')
	}
})


/*****************/
/* === LOGIN === */
/*****************/
app.post('/login', async (req, res) => {
	// Sanitize username (delete '.')
	req.body.username = req.body.username.replace(/\./g, '')
	// Open connection to DB
	await redisClient.connect()
	// Get user's info
	const key = `${redisPrefix}.${req.body.username}`
	const userInfo = JSON.parse(await redisClient.get(key))
	// Close connection to DB
	await redisClient.disconnect()
	// Validate user's info
	const validUser = userInfo && (req.body.username === userInfo.username) && (req.body.password === userInfo.password)
	if (validUser) res.redirect(`chat.html?username=${userInfo.username}&roomname=${userInfo.room}`)
	else res.send('<script>alert("Credentials are incorrect :("); window.location.href = "/"</script>')
})


/****************************/
/* === SERVER LISTENING === */
/****************************/
server.listen(port, () => {
	console.log(`HTTP listening on port ${port}`)
	console.log(`WebSocketServer listening on url:${port}/ws`)
})
