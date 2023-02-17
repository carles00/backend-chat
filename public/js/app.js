const canvas = document.getElementById('canvas');
var chat_input = document.getElementById('chat-input');
var last = performance.now();
var mouse_pos = [0,0];
var imgs = {};

var html = document.querySelector('html');

var App = {
    init: function(){
        Controller.init();
        this.renderLoop();
    },

    renderLoop: function(){
        App.draw();

        var now = performance.now();
        var elapsed_time = (now-last)/1000;
        last = now;
    
        App.update(elapsed_time);
    
        requestAnimationFrame( App.renderLoop );
    },

    draw: function(){
         //for some reason using parent.getBoundingClientRect() caused the canvas to keep expanding
	    let htmlRect = html.getBoundingClientRect();
        let parentRect = canvas.parentNode.getBoundingClientRect();
	    canvas.width =  parentRect.width;
	    canvas.height = htmlRect.height;
        var context = canvas.getContext("2d");

        Render.draw(canvas, context);
    },

    update: function(dt){
        Controller.update(dt);
    },

    getImage(url){
        //check if already loaded
	    if(imgs[url]){
            return imgs[url];
        }
            
        //if not loaded, load and store
        var img = imgs[url] = new Image();
        img.src = url;
        return img;
    },

    onMouse(e){
        var rect = canvas.getBoundingClientRect();
        var canvasx = mouse_pos[0] = e.clientX - rect.left;
        var canvasy = mouse_pos[1] = e.clientY - rect.top;
        mouse_buttons = e.buttons;
        
        Controller.onMouse(e);
    }
}


document.body.addEventListener("mousedown", App.onMouse );
document.body.addEventListener("mousemove", App.onMouse );
document.body.addEventListener("mouseup", App.onMouse );


App.init()
