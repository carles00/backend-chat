/****************************/
/* === GLOBAL VARIABLES === */
/****************************/
const URL = 'wss://ecv-etic.upf.edu/node/9000/ws'
const room_prefix = '_u172793_CHATTER_'
const rooms = ['global', 'programming']
const server = new SillyClient()
const msgs = []
const msg_history = {
  type: 'history',
  content: msgs
}
const colors = [
  '#25d366',
  '#53a6fd',
  '#e26ab6',
  '#fc9775',
  '#ffbc38'
]
let room = null
let user_id = null
let user_name = null


/**********************************/
/* === DOM ELEMENTS RETRIEVAL === */
/**********************************/
const login_container = document.getElementsByClassName('login')[0]
const chat_container =  document.getElementsByClassName('container')[0]
const chat = document.getElementsByClassName('chat')[0]
const user_info = document.getElementsByClassName('user-info')[0]
const input = document.getElementsByClassName('user-input')[0]
const send_btn = document.getElementsByClassName('send-btn')[0]
const private_container_generic = document.getElementById('private')


/************************************/
/* === CONNECTION ESTABLISHMENT === */
/************************************/
const connectToRoom = () => {
  if (rooms.includes(room)) {
    server.connect(URL, room_prefix + room)
    server.on_ready = id => {
      user_id = id
      document.title = `Chatter - ${user_name} [${user_id}]`
      login_container.style.display = 'none'
      chat_container.style.display = ''
      const room_name = document.createElement('span')
      room_name.innerHTML = room.charAt(0).toUpperCase() + room.slice(1)
      const room_img = document.createElement('img')
      room_img.src = `img/${room}-room.jpg`
      room_img.width = '40'
      room_img.height = '40'
      user_info.appendChild(room_name)
      user_info.appendChild(room_img)
    }
  }
}
if (window.location.search !== '') {
  const params = new URLSearchParams(window.location.search)
  if (params.has('username') && params.has('room')) {
    user_name = params.get('username')
    room = params.get('room')
    connectToRoom()
  }
}


/****************************/
/* === MESSAGE HANDLING === */
/****************************/
server.on_user_disconnected = id => {
  placeMSG(assembleSystemMSG(id, 'left'))
}
server.on_user_connected = id => {
  placeMSG(assembleSystemMSG(id, 'entered'))
  server.getRoomInfo(room_prefix + room, info => {
    const selected_id = info.clients[0].toString()
    if (user_id === selected_id) {
      server.sendMessage(JSON.stringify(msg_history), [id])
    }
  })
}
server.on_message = (_id, msg_str) => {
  const msg = JSON.parse(msg_str)
  switch(msg.type) {
    case 'text':
      msgs.push(msg)
      placeMSG(assembleOtherMSG(msg.username, msg.content))
      break
    case 'history':
      msg.content.forEach(history_msg => {
        msgs.push(history_msg)
        if (history_msg.username === user_name) {
          placeMSG(assembleUserMSG(history_msg.content))
        } else { placeMSG(assembleOtherMSG(history_msg.username, history_msg.content)) }
      })
      break
  }
}


/***************************/
/* === EVENT LISTENERS === */
/***************************/
input.addEventListener('keyup', event => {
  if (event.key === 'Enter') {
    sendMSG()
  }
})
send_btn.addEventListener('click', () => {
  sendMSG()
})


/********************************/
/* === FUNCTION DEFINITIONS === */
/********************************/
const sendMSG = () => {
  if (input.value) {
    const msg = {
      type: 'text',
      username: user_name,
      content: input.value
    }
    server.sendMessage(JSON.stringify(msg))
    msgs.push(msg)
    placeMSG(assembleUserMSG(msg.content))
  }
}
const assembleUserMSG = content => {
  // MSG line
  const msg_line = document.createElement('div')
  msg_line.className = 'msg-line msg-line-user'
  // MSG box
  const msg_box = document.createElement('div')
  msg_box.className = 'msg msg-user'
  // MSG text content
  const text = document.createElement('span')
  text.innerHTML = content
  // Assemble all together
  msg_box.appendChild(text)
  msg_line.appendChild(msg_box)
  // Return assembled MSG line
  return msg_line
}
const assembleOtherMSG = (username, content) => {
  // MSG line
  const msg_line = document.createElement('div')
  msg_line.className = 'msg-line msg-line-other'
  // MSG box
  const msg_box = document.createElement('div')
  msg_box.className = 'msg msg-other'
  // MSG text content
  const text = document.createElement('span')
  text.innerHTML = content
  // MSG author username
  const author_line = document.createElement('div')
  const author = document.createElement('span')
  author.innerHTML = username
  author.style.color = colors[Math.floor(Math.random() * colors.length)]
  author.style.cursor = 'pointer'
  author.addEventListener('click', () => {
    chat_container.style.display = 'none'
    const private_container = private_container_generic.cloneNode(true)
    const private_user_name = document.createElement('span')
    private_user_name.innerHTML = author.innerHTML
    const private_user_img = document.createElement('img')
    private_user_img.src = 'img/user.png'
    private_user_img.width = '40'
    private_user_img.height = '40'
    private_container.getElementsByClassName('user-info').appendChild(private_user_name)
    private_container.getElementsByClassName('user-info').appendChild(private_user_img)
    private_container.style.display = ''
  })
  // Assemble all together
  author_line.appendChild(author)
  msg_box.appendChild(author_line)
  msg_box.appendChild(text)
  msg_line.appendChild(msg_box)
  // Return assembled MSG line
  return msg_line
}
const assembleSystemMSG = (id, action) => {
  // MSG line
  const msg_line = document.createElement('div')
  msg_line.className = 'msg-line msg-line-system'
  // MSG box
  const msg_box = document.createElement('div')
  msg_box.className = 'msg msg-system'
  // MSG text content
  const text = document.createElement('span')
  text.innerHTML = `${id} has ${action} the chat`
  // Assemble all together
  msg_box.appendChild(text)
  msg_line.appendChild(msg_box)
  // Return assembled MSG line
  return msg_line
}
const placeMSG = assembled_msg => {
  // Insert the MSG in the document
  chat.appendChild(assembled_msg)
  // Clear the input
  input.value = ''
  // Scroll chat
  chat.scroll({ top: chat.scrollHeight, behavior: 'smooth' })
}
