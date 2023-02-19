let DEBUG = true;
let url = DEBUG
    ? "ws://localhost:9024/ws"
    : "ws://ecv-etic.upf.edu/node/9024/ws";

class Message {
    constructor(type, content, userName, id) {
        this.type = type;
        this.content = content;
        this.userName = userName;
		this.userId = id;
    };

	toJson(){
		return {
			type: this.type,
			content: this.content,
			userName: this.userName,
			userId: this.userId
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
		this.userId = this.client.connect(roomName, userName);

        this.input = chatInput;

		this.client.onId = this.onId.bind(this);
		this.client.onMessage = this.recieveMessage.bind(this);
		this.client.onJoin = this.onJoin.bind(this);

    },

	onId: function(id){
		this.userId = id;
		//once we have an id join the room
		let joinMessage = new Message("join", World.my_user, this.userName, this.userId);

		this.client.sendMessage(JSON.stringify(joinMessage));
	},

	changeRoom(room){
		this.client.connect(room);
		this.roomName = room;
	},

    sendMessage: function () {
		if(this.input.value ==='') return;

        let messageToSend = new Message("text", this.input.value, this.userName, this.userId);
        World.sendMessage(messageToSend.content);
  
		this.client.sendMessage(JSON.stringify(messageToSend));
        this.input.value = "";
    },

	onJoin: function(content){
		World.createUser(content.avatar, content.name, content.roomName, content.position);
	},

    recieveMessage: function (userName, content) {
        World.recieveMessage(userName, content);
    },
};
