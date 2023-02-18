let DEBUG = true
let url = DEBUG ? 'ws://localhost:9024/ws' : 'ws://ecv-etic.upf.edu/node/9024/ws'


class Message {
	constructor(type, content, userName) {
		this.type = type
		this.content = content
		this.userName = userName
	}
}

let room = null
let userId = null
let userName = null

const CHAT = {
	input: null,
  send_button: null,
	client: null,

  init: function () {
		this.client = socketClient.connect(url, 'UserNeme-Room')

		this.input = document.getElementById('user-input')
		this.send_button = document.getElementById('send-btn')

		this.input.addEventListener('keyup', e => {
			if(e.key === 'Enter') this.sendMessage()
		})
	},

	sendMessage: function() {
		console.log(this.input.value)
		let messageToSend = new Message('text', this.input.value, userName)
		WORLD.sendMessage(messageToSend.content)
		// TODO: Send to server
		this.input.value = ''
	},

	recieveMessage: function(id, stringMessage) {
		let message = JSON.parse(stringMessage)
		switch (message.type) {
			case 'text':
				WORLD.recieveMessage(message.userName, message.content)
				break
			case 'target':
				WORLD.setUserTarget(message.userName, message.content)
			default: break
		}
	}
}

CHAT.init()
