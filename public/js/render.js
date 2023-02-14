var FACING_RIGHT = 0;
var FACING_FRONT = 1;
var FACING_LEFT = 2;
var FACING_BACK = 3;
var SCALE = 4;
var SPEED = 40;
var TIMEOUT_MESSAGES = 10000;
var MAX_MESSAGES = 3;
var EXIT_SIGN_Y = -48;
var EXIT_SIGN_HEIGHT = 10;
var DEBUG = false;

function clamp(v, min, max) {
    return v < min ? min : v > max ? max : v;
}
function lerp(a, b, f) {
    return a * (1 - f) + b * f;
}
class User {
    constructor(url, name) {
        this.avatar = url;
        this.name = name;
        this.position = 0;
        this.facing = FACING_FRONT;
        this.animation = "idle";
        this.target = 0;
        this.room = null;
        this.messages = []
    };

    newMessage(text){
        //only last messages shown on canvas
        if(this.messages.length === MAX_MESSAGES){
            //remove oldest message
            this.messages.pop();
        }
        //add to front of array
        this.messages.unshift(text);

        //timer that removes the message after a while
        this.timeoutMessage(TIMEOUT_MESSAGES).then(()=>{
            this.messages.pop();
        });
    };

    timeoutMessage(ms){
        return new Promise(function(resolve){
            setTimeout(resolve, ms);
        })
    };

    toJSOn(){
        
    }
}

class Room {
    constructor(name,url) {
        this.id = -1;
        this.name = name;
        this.url = url;
        this.people = [];
        this.range = [-240, 240, -64, 64]; //left right top bottom
        this.exits = [];
        this.verticalOffset = 0;
    }
    
    addUser(user) {
        this.people.push(user.name);
        user.room = this.name;
    }

    addExit(range, roomName){
        let exit = {
            range: range,
            roomName: roomName,
            active: false
        };
        this.exits.push(exit);
    }
}

var WORLD = {
    userByID: {},
    roomByID:{},
    my_user: null,
    current_room: null,

    addRoom: function(room){
        this.roomByID[room.name] = room;
    },

    addUser: function(user, room){
        this.userByID[user.name] = user;
        room.addUser(user)
    },

    createUser: function(avatarUrl, username, roomName, pos){
        let newUser = new User(avatarUrl, username);
        let room = this.roomByID[roomName];
        newUser.position = pos;
        room.addUser(newUser);
    },

    getUser: function(name){
        return this.userByID[name];
    },

    getRoom: function(name){
        return this.roomByID[name];
    },
    sendMessage: function(text){
        this.my_user.newMessage(text);
    },

    recieveMessage: function(userName, text){
        this.userByID[userName].newMessage(text);
    },

    setUserTarget: function(userName, target){
        this.userByID[userName].target = target;
    }
};

var Render = {
    cam_offset: 0,
    
    animations: {
        idle: [0],
        walking: [2, 3, 4, 5, 6, 7, 8, 9],
        talcking: [0, 1],
    },

    init: function () {
        let room = new Room("user_Name_Home","assets/room1.png");
        WORLD.addRoom(room);
        WORLD.current_room = room;

        WORLD.my_user = new User("assets/userA.png", "user_Name");
        WORLD.addUser(WORLD.my_user, WORLD.current_room);

        //street room
        let street = new Room("street","assets/street.png");
        street.verticalOffset = 50;
        room.addExit([-214,-184],street.name);
        WORLD.addRoom(street);

        street.addExit([-214, -184], room.name);
    },

    draw: function (canvas, ctx) {
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(SCALE, SCALE);
        ctx.translate(this.cam_offset, 0);

        if (WORLD.current_room) {
            this.drawRoom(ctx, WORLD.current_room);
        }

        ctx.restore();
    },

    drawRoom: function (ctx, room) {
        //draw room background
        var img = getImage(room.url);
        ctx.drawImage(img, -img.width / 2, (-img.height / 2) - room.verticalOffset);

        //draw room users
        for (let i = 0; i < room.people.length; i++) {
            this.drawUser(ctx, room.people[i]);
        }

            //draw exits
        room.exits.forEach(exit =>{
            if(exit.active){
                //paint exit marker when debugging
                if(DEBUG){
                    ctx.fillStyle = 'red';
                    ctx.fillRect(exit.range[0], 48, Math.abs(exit.range[0]-exit.range[1]),2);
                } 

                ctx.fillStyle = 'yellow';
                let exitText = `${exit.roomName}`;
                ctx.fillRect(exit.range[0], EXIT_SIGN_Y, Math.abs(exit.range[0]-exit.range[1]),EXIT_SIGN_HEIGHT);
                ctx.font= "5px Arial";
                ctx.fillStyle = 'black';
                ctx.fillText(exitText,exit.range[0]+1,EXIT_SIGN_Y + (EXIT_SIGN_HEIGHT/2));
            }
        });
        
    },

    
    drawUser: function (ctx, userName) {
        let user = WORLD.getUser(userName);
        if (!user.avatar) return;

        let anim = this.animations[user.animation];

        if (!anim) return;

        let time = performance.now() * 0.001;
        let frame = anim[Math.floor(time * 15) % anim.length];

        let img = getImage(user.avatar);
        ctx.drawImage(
            img,
            frame * 32,
            user.facing * 64,
            32,
            64,
            user.position - 16,
            -20,
            32,
            64
        );

        //draw messages
        let messages = user.messages;
        for(let i = 0; i<messages.length; i++){
            ctx.font= "5px Arial";
            let textSize = ctx.measureText(messages[i]);
            //text background
            ctx.fillStyle = 'white';
            ctx.fillRect(user.position - (textSize.width/2) - 1, -32 - (10*i), textSize.width + 2, 8);
            //text
            ctx.fillStyle = 'black'; 
            ctx.fillText(messages[i],user.position - textSize.width/2, -26-(10*i));
        }
            
        //write the name of the user
        ctx.font= "5px Arial";
        ctx.fillStyle = 'black'; 
        let nameSize = ctx.measureText(user.name);
        ctx.fillText(user.name,user.position - nameSize.width/2, 48);
    },

    update: function (dt) {
        let room = WORLD.current_room;
        room.people.forEach(user_name => {
            let user = WORLD.getUser(user_name);

            let diff = user.target - user.position;
            let delta = diff;

            if (delta > 0) {
                delta = SPEED;
            } else if (delta < -0) {
                delta = -SPEED;
            } else {
                delta = 0;
            }
            
            if (Math.abs(diff) < 1) {
                user.position = user.target;
            } else {
                user.position += delta * dt;
            }

            if (delta == 0) {
                user.animation = "idle";
            } else {
                user.animation = "walking";
                if (delta < 1) {
                    user.facing = FACING_LEFT;
                } else {
                    user.facing = FACING_RIGHT;
                }
            }

        });

        //when my user is created
        if (WORLD.my_user) {
            //centered camera on user
            this.cam_offset = lerp(
                this.cam_offset,
                -WORLD.my_user.position,
                0.07
            );

            room.exits.forEach(exit =>{
                if(WORLD.my_user.position > exit.range[0] && WORLD.my_user.position < exit.range[1]){
                    exit.active = true;
                }else{
                    exit.active = false;
                }
            });
        }
    },


    canvasToWorld: function (pos) {
        return [
            (pos[0] - canvas.width / 2) / SCALE - this.cam_offset,
            (pos[1] - canvas.height / 2) / SCALE,
        ];
    },

    onMouse: function (e) {
        if (e.type == "mousedown") {
            let local_pos = this.canvasToWorld([mouse_pos[0], mouse_pos[1]]); 
            if(DEBUG){
                console.log("x: " + local_pos[0] + ", y: " + local_pos[1]);
            }
            //only move when clicking inside the room verticaly
            if(local_pos[1] > WORLD.current_room.range[2] && local_pos[1] < WORLD.current_room.range[3]){
                WORLD.my_user.target = clamp(local_pos[0],WORLD.current_room.range[0], WORLD.current_room.range[1]);
            }

            //check for click inside active exit sign
            WORLD.current_room.exits.forEach(exit =>{
                if(exit.active){
                    if(local_pos[0]> exit.range[0] && local_pos[0] < exit.range[1] && local_pos[1] > EXIT_SIGN_Y && local_pos[1] < EXIT_SIGN_Y + EXIT_SIGN_HEIGHT){
                        let newRoom = WORLD.roomByID[exit.roomName];
                        newRoom.addUser(WORLD.my_user);
                        WORLD.current_room = newRoom;
                    }
                }
            });
            
        } else if (e.type == "mousemove") {
        } //mouseup
        else {
        }
    },
};
