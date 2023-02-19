let SCALE = 4;
let SPEED = 40;
let EXIT_SIGN_Y = -48;
let EXIT_SIGN_HEIGHT = 10;

function clamp(v, min, max) {
    return v < min ? min : v > max ? max : v;
}
function lerp(a, b, f) {
    return a * (1 - f) + b * f;
}

const Render = {
    cam_offset: 0,
    animations: {
        idle: [0],
        walking: [2, 3, 4, 5, 6, 7, 8, 9],
        talcking: [0, 1],
    },

    init: function () {},

    draw: function (canvas, ctx) {
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(SCALE, SCALE);
        ctx.translate(this.cam_offset, 0);

        if (World.current_room) this.drawRoom(ctx, World.current_room);
        ctx.restore();
    },

    drawRoom: function (ctx, room) {
        // draw room background
        let img = App.getImage(room.url);
        ctx.drawImage(
            img,
            -img.width / 2,
            -img.height / 2 - room.verticalOffset
        );

        // draw room users
        for (let i = 0; i < room.people.length; i++) {
            this.drawUser(ctx, room.people[i]);
        }

        // draw exits
        room.exits.forEach((exit) => {
            if (exit.active) {
                // paint exit marker when debugging
                if (DEBUG) {
                    ctx.fillStyle = "red";
                    ctx.fillRect(
                        exit.range[0],
                        48,
                        Math.abs(exit.range[0] - exit.range[1]),
                        2
                    );
                }

                ctx.fillStyle = "yellow";
                let exitText = `${exit.roomName}`;
                ctx.fillRect(
                    exit.range[0],
                    EXIT_SIGN_Y,
                    Math.abs(exit.range[0] - exit.range[1]),
                    EXIT_SIGN_HEIGHT
                );
                ctx.font = "5px Arial";
                ctx.fillStyle = "black";
                ctx.fillText(
                    exitText,
                    exit.range[0] + 1,
                    EXIT_SIGN_Y + EXIT_SIGN_HEIGHT / 2
                );
            }
        });
    },

    drawUser: function (ctx, userName) {
        let user = World.getUser(userName);
        if (!user.avatar) return;

        let anim = this.animations[user.animation];
        if (!anim) return;

        let time = performance.now() * 0.001;
        let frame = anim[Math.floor(time * 15) % anim.length];

        let img = App.getImage(user.avatar);
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

        // draw messages
        let messages = user.messages;
        for (let i = 0; i < messages.length; i++) {
            ctx.font = "5px Arial";
            let textSize = ctx.measureText(messages[i]);
            // text background
            ctx.fillStyle = "white";
            ctx.fillRect(
                user.position - textSize.width / 2 - 1,
                -32 - 10 * i,
                textSize.width + 2,
                8
            );
            // text
            ctx.fillStyle = "black";
            ctx.fillText(
                messages[i],
                user.position - textSize.width / 2,
                -26 - 10 * i
            );
        }

        // write the name of the user
        ctx.font = "5px Arial";
        ctx.fillStyle = "black";
        let nameSize = ctx.measureText(user.name);
        ctx.fillText(user.name, user.position - nameSize.width / 2, 48);
    },

    canvasToWorld: function (pos) {
        return [
            (pos[0] - canvas.width / 2) / SCALE - this.cam_offset,
            (pos[1] - canvas.height / 2) / SCALE,
        ];
    },
};
