const socket = new WebSocket("ws://ecv-etic.upf.edu/node/9024/ws");

const msgs = [];
const msg_history = {
  type: 'history',
  content: msgs
};
const colors = [
  '#25d366',
  '#53a6fd',
  '#e26ab6',
  '#fc9775',
  '#ffbc38'
];
let room = null;
let user_id = null;
let user_name = null;

const chat = document.getElementById('chat-container');
const input = document.getElementById('user-input');
const send_btn = document.getElementById('send-btn');