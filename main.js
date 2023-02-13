const express = require('express')
const http = require('http')
let WebSocketServer = require('websocket').server

const app = express()
const server = http.createServer(app)
const wss = new WebSocketServer({ httpServer:server })
const port = process.argv[2] ? process.argv[2] : 9024

app.use(express.static('public'))
// Creating connection using websocket
wss.on("request", function(request){
  console.log("new client connected")
})

server.listen(port, function(){
	console.log(`HTTP listening on port ${port}`)
	console.log(`WebSocketServer listening on url:${port}/ws`)
})
