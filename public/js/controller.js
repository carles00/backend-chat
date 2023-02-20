const Controller = {
  init: function (userName, roomName) {
    // user room
    // on the db search for the room url by roomname
    // search for user avatar on the db by username
    let room = new Room(roomName, 'assets/room1.png')
    World.addRoom(room)
    World.current_room = room
    World.my_user = new User('assets/usera.png', userName)
    World.addUser(World.my_user, World.current_room)
    // street room
    let street = new Room('street', 'assets/street.png')
    street.verticalOffset = 50
    room.addExit([-214, -184], street.name)
    World.addRoom(street)
    street.addExit([-214, -184], room.name)
  },

  onMouse: function (e) {
    if (e.type == "mousedown") {
      let local_pos = Render.canvasToWorld([mouse_pos[0], mouse_pos[1]])
      // if (DEBUG) console.log('x: ' + local_pos[0] + ', y: ' + local_pos[1])
      // only move when clicking inside the room verticaly
      if (local_pos[1] > World.current_room.range[2] && local_pos[1] < World.current_room.range[3]) {
        World.my_user.target = clamp(
          local_pos[0],
          World.current_room.range[0],
          World.current_room.range[1]
        )
      }
      //check for click inside active exit sign
      World.current_room.exits.forEach((exit) => {
        if (exit.active) {
          if (local_pos[0] > exit.range[0] && local_pos[0] < exit.range[1] && local_pos[1] > EXIT_SIGN_Y && local_pos[1] < EXIT_SIGN_Y + EXIT_SIGN_HEIGHT) {
            //change rooms by adding user to new room and deleting user from old room
            let newRoom = World.roomByID[exit.roomName]
            newRoom.addUser(World.my_user)
            World.current_room.exitRoom(World.my_user)
            World.current_room = newRoom
            Chat.changeRoom(World.current_room.name)
          }
        }
      })
    }
  },

  update: function (dt) {
    let room = World.current_room;
    room.people.forEach(user_name => {
      let user = World.getUser(user_name)
      let diff = user.target - user.position
      let delta = diff

      if (delta > 0) delta = SPEED
      else if (delta < -0) delta = -SPEED
      else delta = 0
      if (Math.abs(diff) < 1) user.position = user.target
      else user.position += delta * dt
      if (delta == 0) user.animation = 'idle'
      else {
        user.animation = 'walking'
        if (delta < 1) user.facing = FACING_LEFT
        else user.facing = FACING_RIGHT
      }
    })
    // when my user is created
    if (World.my_user) {
      // centered camera on user
      Render.cam_offset = lerp(Render.cam_offset, -World.my_user.position, 0.07)
      room.exits.forEach(exit => {
          if (World.my_user.position > exit.range[0] && World.my_user.position < exit.range[1]) exit.active = true
          else exit.active = false
      })
    }
  },
}
