/****************************/
/* === CommonJS MODULES === */
/****************************/
const http = require('http')
const redis = require('redis')
const express = require('express')
const bodyParser = require('body-parser')
const WebSocketServer = require('websocket').server


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

wss.on('request', () => console.log('new client connected'))  // DEBUG


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
					res.redirect(`./chat.html?${userInfo.username}&${userInfo.room}`)
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
