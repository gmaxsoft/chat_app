declare const io: any;
const socket = io();

let currentRoom: string | null = null;

// Login functionality
const loginBtn = document.getElementById('loginBtn') as any;
const usernameInput = document.getElementById('username') as any;
const passwordInput = document.getElementById('password') as any;
const loginError = document.getElementById('loginError') as any;

loginBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (username && password) {
        socket.emit('login', { username, password });
    }
});

// Chat functionality
const chatDiv = document.getElementById('chat') as any;
const loginDiv = document.getElementById('login') as any;
const roomBtns = document.querySelectorAll('.room-btn') as any;
const currentRoomDiv = document.getElementById('currentRoom') as any;
const messagesDiv = document.getElementById('messages') as any;
const messageInput = document.getElementById('messageInput') as any;
const fileInput = document.getElementById('fileInput') as any;
const sendBtn = document.getElementById('sendBtn') as any;
const leaveBtn = document.getElementById('leaveBtn') as any;

// Room selection
roomBtns.forEach((btn: any) => {
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

// Allow sending message with Enter key
messageInput.addEventListener('keypress', (e: any) => {
    if (e.key === 'Enter') {
        const message = messageInput.value.trim();
        if (message && currentRoom) {
            socket.emit('sendMessage', { room: currentRoom, message });
            messageInput.value = '';
        }
    }
});

// Send file
fileInput.addEventListener('change', (e: any) => {
    const target = e.target as any;
    const file = target.files?.[0];
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
socket.on('loginSuccess', (_data: any) => {
    loginDiv.classList.add('hidden');
    chatDiv.classList.remove('hidden');
});

socket.on('loginError', (error: string) => {
    loginError.textContent = error;
});

socket.on('joinedRoom', (room: string) => {
    console.log('Joined room:', room);
});

socket.on('userJoined', (username: string) => {
    const messageDiv = (document as any).createElement('div');
    messageDiv.className = 'message';
    messageDiv.textContent = `${username} dołączył do pokoju`;
    messagesDiv.appendChild(messageDiv);
});

socket.on('userLeft', (username: string) => {
    const messageDiv = (document as any).createElement('div');
    messageDiv.className = 'message';
    messageDiv.textContent = `${username} opuścił pokój`;
    messagesDiv.appendChild(messageDiv);
});

socket.on('newMessage', (data: any) => {
    const messageDiv = (document as any).createElement('div');
    messageDiv.className = 'message';

    if (data.file) {
        const link = data.file.filepath.startsWith('/uploads/') ? data.file.filepath : `/uploads/${data.file.filename}`;
        messageDiv.innerHTML = `
            <span class="username">${data.username}</span> wysłał plik:
            <a href="${link}" target="_blank" download="${data.file.filename}">${data.file.filename}</a>
            <div class="timestamp">${new Date(data.timestamp).toLocaleString()}</div>
        `;
    } else {
        messageDiv.innerHTML = `
            <span class="username">${data.username}:</span> ${data.message.replace(/\n/g, '<br>')}
            <div class="timestamp">${new Date(data.timestamp).toLocaleString()}</div>
        `;
    }

    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});