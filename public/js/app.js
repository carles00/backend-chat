const html = document.querySelector("html");
const canvas = document.getElementById("canvas");
const chatInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-btn");

const urlString = window.location.search;

const params = new URLSearchParams(urlString);

const USERNAME = params.get("username");
const ROOMNAME = params.get("roomname");

const imgs = {};
let last = performance.now();
let mouse_pos = [0, 0];

const App = {
    init: function (userName, roomName, input) {
        Chat.init(userName, roomName, input);

        Controller.init(userName, roomName);

        this.renderLoop();
    },

    renderLoop: function () {
        App.draw();

        let now = performance.now();
        let elapsed_time = (now - last) / 1000;
        last = now;

        App.update(elapsed_time);

        requestAnimationFrame(App.renderLoop);
    },

    draw: function () {
        // for some reason using parent.getBoundingClientRect() caused the canvas to keep expanding
        let htmlRect = html.getBoundingClientRect();
        let parentRect = canvas.parentNode.getBoundingClientRect();
        canvas.width = parentRect.width;
        canvas.height = htmlRect.height;
        let context = canvas.getContext("2d");

        Render.draw(canvas, context);
    },

    update: function (dt) {
        Controller.update(dt);
    },

    getImage(url) {
        // check if already loaded
        if (imgs[url]) {
            return imgs[url];
        }

        //if not loaded, load and store
        let img = (imgs[url] = new Image());
        img.src = url;
        return img;
    },

    onMouse(e) {
        let rect = canvas.getBoundingClientRect();
        let canvasx = (mouse_pos[0] = e.clientX - rect.left);
        let canvasy = (mouse_pos[1] = e.clientY - rect.top);
        mouse_buttons = e.buttons;

        Controller.onMouse(e);
    },
};

document.body.addEventListener("mousedown", App.onMouse);
document.body.addEventListener("mousemove", App.onMouse);
document.body.addEventListener("mouseup", App.onMouse);

chatInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") Chat.sendMessage();
});

sendButton.addEventListener("click", (e) => {
    Chat.sendMessage();
});


App.init(USERNAME, ROOMNAME, chatInput);
