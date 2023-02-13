const onUserConnected = connection => {
  console.log(connection)
}

const onUserDisconnected = () => {}

const onMessage = msg => {
  console.log(msg)
}

const sendToRoom = (room, msg) => {
  room.people.forEach(user => {
    console.log(user)
  })
}
