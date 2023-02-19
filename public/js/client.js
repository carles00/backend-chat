class SocketClient{
    constructor(url){
        this.url = url;
        this.socket = null;
        this.room = null;
        this.onConnect = null;
        this.onMessage = null;
        this.onJoin = null;
        this.onCreateUsers = null;
        this.onRecieveUserUpdate = null;
    }

    connect(room, userName){
        let urlString = url +"/"+room;
        this.socket = new WebSocket(urlString);
        this.socket.onopen = () =>{
            console.log('Connected');
            //this.sendMessage(JSON.stringify(new Message("get_room_asset", null, userName)));
        }

        this.socket.onmessage = (message) => {
            this.processMessageFromServer(JSON.parse(message.data));
        }
    }

    sendMessage(message){
        this.socket.send(message);
    }

    processMessageFromServer(message){
        switch (message.type) {
            case 'id':
                if(this.onId){
                    this.onId(message.content);
                }
            break;
            case 'text':
                if(this.onMessage){
                    this.onMessage(message.userName, message.content);
                }
            break;
            case 'join':
                if(this.onJoin){
                    this.onJoin(message.content);
                }
            break;
            case 'create_users':
                if(this.onCreateUsers){
                    this.onCreateUsers(message.content);
                }
                break;
            case 'recieve-update':
                if(this.onRecieveUserUpdate){
                    this.onRecieveUserUpdate(message.userName, message.content);
                }
                break;
            case 'room_asset':
                console.log(message);
                break;
            default:
                break;
        }
    }
}
