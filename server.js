// GET value from key in Redis DB
redis.get('key', (err, value) => {
  if (err) console.error(`Error getting key: ${err}`)
  else console.log(`The key has the value: ${value}`)
})

// PUT key-value pair in Redis DB
redis.put('key', 'value', err => {
  if (err) console.error(`Error putting key: ${err}`)
  else console.log('Key saved successfully!')
})




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
