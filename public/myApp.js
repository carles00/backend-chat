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

function User() {
    this.avatar = "user.png";
    this.name = "unnamed";
    this.position = 0;
    this.facing = FACING_FRONT;
    this.animation = "idle";
    this.target = 0;
}

function Room(name) {
    this.id = -1;
    this.name = name;
    this.url = null;
    this.people = [];
    this.range = [-100, 100];
}

Room.prototype.addUser = function (user) {
    this.people.push(user);
    user.room = this;
};

var WORLD = {
    last_id: 0,
    rooms: [],
    roomsById: {},
    createRoom: function (name, url) {
        var room = new Room(name);
        room.id = this.last_id++;
        room.url = url;

        this.rooms.push(room);

        return room;
    },
};

var MyApp = {
    current_room: null,
    my_user: null,
    cam_offset: 0,

    init: function () {
        this.current_room = WORLD.createRoom("hall", "background.png");

        this.my_user = new User();

        this.current_room.addUser(this.my_user);
    },

    draw: function (canvas, ctx) {
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "red";

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(SCALE, SCALE);
        ctx.translate(this.cam_offset, 0);

        if (this.current_room) {
            this.drawRoom(ctx, this.current_room);
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

    animations: {
        idle: [0],
        walking: [2, 3, 4, 5, 6, 7, 8, 9],
        talcking: [0, 1],
    },

    drawUser: function (ctx, user) {
        if (!user.avatar) return;

        var anim = this.animations[user.animation];

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
    },

    update: function (dt) {
        let room = this.current_room;
        room.people.forEach(user => {
            
        });
        
        if (this.my_user) {
            let room = this.my_user.room;
            this.my_user.target = clamp(
                this.my_user.target,
                room.range[0],
                room.range[1]
            );
            let diff = this.my_user.target - this.my_user.position;
            let delta = diff;

            if (delta > 0) {
                delta = SPEED;
            } else if (delta < -0) {
                delta = -SPEED;
            } else {
                delta = 0;
            }

            if (Math.abs(diff) < 1) {
                this.my_user.position = this.my_user.target;
            } else {
                this.my_user.position += delta * dt;
            }

            if (delta == 0) {
                this.my_user.animation = "idle";
            } else {
                this.my_user.animation = "walking";
                if (delta < 1) {
                    this.my_user.facing = FACING_LEFT;
                } else {
                    this.my_user.facing = FACING_RIGHT;
                }
            }

            this.cam_offset = lerp(
                this.cam_offset,
                -this.my_user.position,
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
            let local_pos = this.canvasToWorld([mouse_pos[0], mouse_pos[1]]);
            this.my_user.target = local_pos[0];
        } else if (e.type == "mousemove") {
        } //mouseup
        else {
        }
    },
};
