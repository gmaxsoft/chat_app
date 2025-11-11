const socket = io();
let currentRoom = null;
// Login functionality
const loginBtn = document.getElementById('loginBtn');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginError = document.getElementById('loginError');
loginBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    if (username && password) {
        socket.emit('login', { username, password });
    }
});
// Chat functionality
const chatDiv = document.getElementById('chat');
const loginDiv = document.getElementById('login');
const roomBtns = document.querySelectorAll('.room-btn');
const currentRoomDiv = document.getElementById('currentRoom');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const fileInput = document.getElementById('fileInput');
const sendBtn = document.getElementById('sendBtn');
const leaveBtn = document.getElementById('leaveBtn');
// Room selection
roomBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
        const room = btn.getAttribute('data-room');
        if (room && room !== currentRoom) {
            if (currentRoom) {
                socket.emit('leaveRoom', currentRoom);
            }
            socket.emit('joinRoom', room);
            currentRoom = room;
            currentRoomDiv.textContent = `Aktualny pokój: ${room}`;
            messagesDiv.innerHTML = '';
        }
    });
});
// Send message
sendBtn.addEventListener('click', () => {
    const message = messageInput.value.trim();
    if (message && currentRoom) {
        socket.emit('sendMessage', { room: currentRoom, message });
        messageInput.value = '';
    }
});
// Send file
fileInput.addEventListener('change', (e) => {
    var _a;
    const target = e.target;
    const file = (_a = target.files) === null || _a === void 0 ? void 0 : _a[0];
    if (file && currentRoom) {
        const formData = new FormData();
        formData.append('file', file);
        fetch('/upload', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
            socket.emit('sendMessage', { room: currentRoom, message: `[Plik: ${file.name}]`, file: data });
            target.value = '';
        })
            .catch(error => {
            console.error('Upload error:', error);
        });
    }
});
// Leave room
leaveBtn.addEventListener('click', () => {
    if (currentRoom) {
        socket.emit('leaveRoom', currentRoom);
        currentRoom = null;
        currentRoomDiv.textContent = '';
        messagesDiv.innerHTML = '';
    }
});
// Socket event listeners
socket.on('loginSuccess', (data) => {
    loginDiv.classList.add('hidden');
    chatDiv.classList.remove('hidden');
});
socket.on('loginError', (error) => {
    loginError.textContent = error;
});
socket.on('joinedRoom', (room) => {
    console.log('Joined room:', room);
});
socket.on('userJoined', (username) => {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    messageDiv.textContent = `${username} dołączył do pokoju`;
    messagesDiv.appendChild(messageDiv);
});
socket.on('userLeft', (username) => {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    messageDiv.textContent = `${username} opuścił pokój`;
    messagesDiv.appendChild(messageDiv);
});
socket.on('newMessage', (data) => {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    if (data.file) {
        messageDiv.innerHTML = `
            <span class="username">${data.username}</span> wysłał plik: 
            <a href="${data.file.filepath}" target="_blank">${data.file.filename}</a>
            <div class="timestamp">${new Date(data.timestamp).toLocaleString()}</div>
        `;
    }
    else {
        messageDiv.innerHTML = `
            <span class="username">${data.username}:</span> ${data.message}
            <div class="timestamp">${new Date(data.timestamp).toLocaleString()}</div>
        `;
    }
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});
