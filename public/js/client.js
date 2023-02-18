const socketClient = {
    url: null,
    room: null,
    socket: null,

    connect: function(url, room) {
        this.url = url
        let urlString = url + '/' + room
        this.socket = new WebSocket(url)
    }
}
