const canvas = document.getElementById('canvas');
var chat_input = document.getElementById('chat-input');
var last = performance.now();
var mouse_pos = [0,0];
var imgs = {};

function renderLoop(){
    draw();

    var now = performance.now();
    var elapsed_time = (now-last)/1000;
    last = now;

    update(elapsed_time);

    requestAnimationFrame( renderLoop );
}

function draw(){
    var parent = canvas.parentNode;
	var rect = parent.getBoundingClientRect();
	canvas.width = rect.width;
	canvas.height = rect.height;

    var context = canvas.getContext("2d");

    Render.draw(canvas, context);
}



function update(elapsed_time){
    Render.update(elapsed_time);
}

function getImage(url)
{
	//check if already loaded
	if(imgs[url])
		return imgs[url];


	//if no loaded, load and store
	var img = imgs[url] = new Image();
	img.src = url;
	return img;
}


function onMouse( e ) { 

    var rect = canvas.getBoundingClientRect();
    var canvasx = mouse_pos[0] = e.clientX - rect.left;
    var canvasy = mouse_pos[1] = e.clientY - rect.top;
    mouse_buttons = e.buttons;
 
    Render.onMouse(e);
};

document.body.addEventListener("mousedown", onMouse );
document.body.addEventListener("mousemove", onMouse );
document.body.addEventListener("mouseup", onMouse );

chat_input.addEventListener('keyup', e => {
    if (e.code === 'Enter') {
      console.log(chat_input.value);
    }
});

Render.init();
renderLoop();
