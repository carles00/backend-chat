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

const key = `${redisPrefix}.${userName}`
redisClient.get(key, (err, value) => {
  if (err) console.error(`Error getting key: ${err}`)
  else {
    // JSON.parse(value).room.replace(/\s/g, '').toLowerCase()
    // JSON.parse(value).skin.replace(/\s/g, '').toLowerCase()
  }
})