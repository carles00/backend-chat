let DEBUG = true;
let url = DEBUG
    ? "ws://localhost:9024/ws"
    : "ws://ecv-etic.upf.edu/node/9024/ws";

class Message {
    constructor(type, content, userName) {
        this.type = type;
        this.content = content;
        this.userName = userName;
    };

	toJson(){
		return {
			type: this.type,
			content: this.content,
			userName: this.userName
		}
	}
}

const Chat = {
    input: null,
    client: null,
    userName: null,
    roomName: null,

	userId: null,

    init: function (userName, roomName, chatInput) {
        this.userName = userName;
        this.roomName = roomName;
		this.client = new SocketClient(url);
		this.userId = this.client.connect(roomName);

        this.input = chatInput;

		this.client.onId = this.onId.bind(this);
		this.client.onMessage = this.recieveMessage.bind(this);
    },

	onId: function(id){
		this.userId = id;
	},

    sendMessage: function () {
		if(this.input.value ==='') return;

        let messageToSend = new Message("text", this.input.value, this.userName);
        World.sendMessage(messageToSend.content);
  
		this.client.sendMessage(JSON.stringify(messageToSend));
        this.input.value = "";
    },

    recieveMessage: function (id, stringMessage) {
        let message = JSON.parse(stringMessage);
        switch (message.type) {
            case "text":
                World.recieveMessage(message.userName, message.content);
                break;
            case "target":
                World.setUserTarget(message.userName, message.content);
            default:
                break;
        }
    },
};
