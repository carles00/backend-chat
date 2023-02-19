class SocketClient{
    constructor(url){
        this.url = url;
        this.socket = null;
        this.room = null;
        this.onConnect = null;
        this.onMessage = null;
    }

    connect(room){
        let urlString = url +"/"+room;
        this.socket = new WebSocket(urlString);
        this.socket.onopen = () =>{
            console.log('Connected');
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
            case 'message':
                if(this.onMessage){
                    this.onMessage(message.id, message.content);
                }
                   
            break;
            
            default:
                break;
        }
    }
}
