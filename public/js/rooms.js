let FACING_RIGHT = 0
let FACING_FRONT = 1
let FACING_LEFT = 2
let FACING_BACK = 3
let TIMEOUT_MESSAGES = 10000
let MAX_MESSAGES = 3

class User {
  constructor(url, name) {
    this.avatar = url
    this.name = name
    this.userID = null
    this.position = 0
    this.facing = FACING_FRONT
    this.animation = 'idle'
    this.target = 0
    this.room = null
    this.messages = []
  }

  newMessage(text) {
    // only last messages shown on canvas (remove oldest message)
    if (this.messages.length === MAX_MESSAGES) this.messages.pop()
    // add to front of array
    this.messages.unshift(text)
    // timer that removes the message after a while
    this.timeoutMessage(TIMEOUT_MESSAGES).then(() => this.messages.pop())
  }

  timeoutMessage(ms) { return new Promise((resolve) => setTimeout(resolve, ms)) }

  toJSON() {
    return {
      avatar: this.avatar,
      name: this.name,
      position: this.position,
      facing: this.facing,
      target: this.target,
      roomName: this.room 
    }
  }
}

class Room {
  constructor(name, url) {
    this.id = -1
    this.name = name
    this.url = url
    this.people = []
    this.range = [-240, 240, -64, 64]  // left right top bottom
    this.exits = []
    this.verticalOffset = 0
  }

  addUser(user) {
    this.people.push(user.name)
    user.room = this.name
  }

  addExit(range, roomName) {
    this.exits.push({
      range: range,
      roomName: roomName,
      active: false
    })
  }

  exitRoom(user) {
    for (let i = 0; i < this.people.length; i++) {
      const userName = this.people[i]
      if (userName === user.name) this.people.splice(i, 1)
    }
  }
}

const World = {
  userByID: {},
  roomByID: {},
  my_user: null,
  current_room: null,

  addRoom: function (room) { this.roomByID[room.name] = room },

  addUser: function (user, room) {
    this.userByID[user.name] = user
    room.addUser(user)
  },

  createUser: function (avatarUrl, username, roomName, pos) {
    if (!this.userByID[username]) {
      let newUser = new User(avatarUrl, username)
      let room = this.roomByID[roomName]
      newUser.position = pos
      this.userByID[newUser.name] = newUser
      room.addUser(newUser)
    }
  },

  getUser: function (name) { return this.userByID[name] },
  getRoom: function (name) { return this.roomByID[name] },
  sendMessage: function (text) { this.my_user.newMessage(text) },
  recieveMessage: function (userName, text) { this.userByID[userName].newMessage(text) },
  setUserTarget: function (userName, target) { this.userByID[userName].target = target },

  setRoomAsset: function(userName, asset){
    let roomStr = this.userByID[userName].room;
    let room = this.roomByID[roomStr];

    room.url = asset;
  },

  updateUser: function(userName, userObj) {
    let userToUpdate = this.userByID[userName]
    userToUpdate.avatar = userObj.avatar
    userToUpdate.position = userObj.position
    userToUpdate.facing = userObj.facing
    userToUpdate.target = userObj.target
  },

  setUserSkin: function(userName, skin){
    let user = this.userByID[userName];
    user.avatar = skin;
  },

  deleteUser: function(userName){
    let idx = this.current_room.people.indexOf(userName);
    this.current_room.splice(idx, 1);

    delete this.userByID[userName];
  }
}

if (typeof window == "undefined") {
  module.exports = {
    World,
    Room,
    User,
    FACING_BACK,
    FACING_FRONT,
    FACING_LEFT,
    FACING_RIGHT,
    MAX_MESSAGES,
    TIMEOUT_MESSAGES
  }
}
