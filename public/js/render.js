var FACING_RIGHT = 0;
var FACING_FRONT = 1;
var FACING_LEFT = 2;
var FACING_BACK = 3;
var SCALE = 4;
var SPEED = 40;

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
        if(this.messages.length === 3){
            //remove oldest message
            this.messages.pop();
        }
        //add to front of array
        this.messages.unshift(text);

        //TODO some kind of timer to remove messages after a while
    };
}

class Room {
    constructor(name) {
        this.id = -1;
        this.name = name;
        this.url = null;
        this.people = [];
        this.range = [-240, 240, -64, 64]; //left right top bottom
    }
    
    addUser(user) {
        this.people.push(user.name);
        user.room = this.name;
    }
}

var WORLD = {
    userByID: {},
    roomByID:{},
    my_user: null,
    current_room: null,

    createRoom: function (name, url) {
        let room = new Room(name);
        room.url = url;

        this.roomByID[room.name] = room;
        return room;
    },

    addUser: function(user, room){
        this.userByID[user.name] = user;
        room.addUser(user)
    },

    getUser: function(name){
        return this.userByID[name];
    },

    getRoom: function(name){
        return this.roomByID[name];
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
        WORLD.current_room = WORLD.createRoom("hall", "room.png");

        WORLD.my_user = new User("user.png", "unnamed");
        WORLD.addUser(WORLD.my_user, WORLD.current_room);
        let testUser = new User("spritesheet.png", "otherUser");
        WORLD.addUser(testUser, WORLD.current_room);
    
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
        ctx.drawImage(img, -img.width / 2, -img.height / 2);

        //draw room users
        for (let i = 0; i < room.people.length; i++) {
            this.drawUser(ctx, room.people[i]);
        }
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

        //TODO clean up code
        
        let messages = user.messages;
        for(let i = 0; i<messages.length; i++){
            ctx.font= "5px Arial";
            let textSize = ctx.measureText(messages[i]);
            ctx.fillStyle = 'white';
            ctx.fillRect(user.position - textSize.width/2, -32 - (10*i), textSize.width + 2, 8);
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

        //cammera centered on my_user
        if (WORLD.my_user) {
            this.cam_offset = lerp(
                this.cam_offset,
                -WORLD.my_user.position,
                0.07
            );
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
            //only process clicks inside canvas
            if(mouse_pos[0]< canvas.getBoundingClientRect().width){
                let local_pos = this.canvasToWorld([mouse_pos[0], mouse_pos[1]]); 
                //only move when clicking inside the room verticaly
                if(local_pos[1] > WORLD.current_room.range[2] && local_pos[1] < WORLD.current_room.range[3]){
                    WORLD.my_user.target = clamp(local_pos[0],WORLD.current_room.range[0], WORLD.current_room.range[1]);
                }
            }
            
        } else if (e.type == "mousemove") {
        } //mouseup
        else {
        }
    },
};
