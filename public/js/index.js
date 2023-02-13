const canvas = document.getElementById('canvas')
let chat_input = document.getElementById('chat-input')
let last = performance.now()
let mouse_pos = [0,0]
const imgs = {}

function renderLoop() {
  draw()
  
  var now = performance.now()
  var elapsed_time = (now - last) / 1000
  last = now
  
  update(elapsed_time)
  
  requestAnimationFrame(renderLoop)
}

function draw() {
  let parent = canvas.parentNode
  let rect = parent.getBoundingClientRect()
  canvas.width = rect.width
  canvas.height = rect.height
  
  let context = canvas.getContext('2d')
  
  Render.draw(canvas, context)
}



function update(elapsed_time) {
  Render.update(elapsed_time)
}

function getImage(url) {
  //check if already loaded
  if (imgs[url]) return imgs[url]
  
  //if no loaded, load and store
  let img = imgs[url] = new Image()
  img.src = url
  return img
}


function onMouse(e) { 
  let rect = canvas.getBoundingClientRect()
  let canvasx = mouse_pos[0] = e.clientX - rect.left
  let canvasy = mouse_pos[1] = e.clientY - rect.top
  mouse_buttons = e.buttons
  
  Render.onMouse(e)
}


document.body.addEventListener('mousedown', onMouse)
document.body.addEventListener('mousemove', onMouse)
document.body.addEventListener('mouseup', onMouse)

chat_input.addEventListener('keyup', e => {
  if (e.code === 'Enter') {
      console.log(chat_input.value)
  }
})

Render.init()
renderLoop()
