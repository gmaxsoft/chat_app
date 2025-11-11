declare const io: any;
const socket = io();

let currentRoom: string | null = null;

// Login functionality
const usernameInput = document.getElementById('username') as any;
const passwordInput = document.getElementById('password') as any;
const loginError = document.getElementById('loginError') as any;

const loginForm = document.getElementById('loginForm') as any;
loginForm.addEventListener('submit', (e: any) => {
    e.preventDefault();
    console.log('Form submitted, preventing default');
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    console.log('Login attempt:', username, password ? '[PASSWORD]' : '[EMPTY]');

    if (username && password) {
        console.log('Emitting login event');
        socket.emit('login', { username, password });
    } else {
        console.log('Missing username or password');
    }
});

// Chat functionality
const chatDiv = document.getElementById('chat') as any;
const loginDiv = document.getElementById('login') as any;
const roomBtns = document.querySelectorAll('.room-btn') as any;
const currentRoomDiv = document.getElementById('currentRoom') as any;
const messagesDiv = document.getElementById('messages') as any;
const messageEditor = document.getElementById('messageEditor') as any;
const boldBtn = document.getElementById('boldBtn') as any;
const italicBtn = document.getElementById('italicBtn') as any;
const underlineBtn = document.getElementById('underlineBtn') as any;
const clearBtn = document.getElementById('clearBtn') as any;
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

// Editor toolbar functionality
boldBtn.addEventListener('click', () => {
    document.execCommand('bold');
    messageEditor.focus();
});

italicBtn.addEventListener('click', () => {
    document.execCommand('italic');
    messageEditor.focus();
});

underlineBtn.addEventListener('click', () => {
    document.execCommand('underline');
    messageEditor.focus();
});

clearBtn.addEventListener('click', () => {
    document.execCommand('removeFormat');
    messageEditor.innerHTML = '';
    messageEditor.focus();
});

// Send message
sendBtn.addEventListener('click', () => {
    const message = messageEditor.innerHTML.trim();
    if (message && currentRoom) {
        socket.emit('sendMessage', { room: currentRoom, message });
        messageEditor.innerHTML = '';
    }
});

// Allow sending message with Ctrl+Enter
messageEditor.addEventListener('keydown', (e: any) => {
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault(); // Prevent default behavior
        const message = messageEditor.innerHTML.trim();
        if (message && currentRoom) {
            socket.emit('sendMessage', { room: currentRoom, message });
            messageEditor.innerHTML = '';
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
socket.on('loginSuccess', (data: any) => {
    console.log('Login successful, switching to chat view', data);
    console.log('loginDiv:', loginDiv);
    console.log('chatDiv:', chatDiv);
    loginDiv.classList.add('hidden');
    chatDiv.classList.remove('hidden');
    console.log('View switched successfully');
});

socket.on('loginError', (error: string) => {
    console.log('Login error:', error);
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
        const fileName = data.file.filename.toLowerCase();

        // Check if it's an image file
        if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png') || fileName.endsWith('.gif') || fileName.endsWith('.webp')) {
            messageDiv.innerHTML = `
                <span class="username">${data.username}</span> wysłał zdjęcie:
                <div class="image-container">
                    <img src="${link}" alt="${data.file.filename}" class="message-image" onclick="window.open('${link}', '_blank')">
                    <div class="image-overlay">
                        <a href="${link}" download="${data.file.filename}" class="download-btn">Pobierz</a>
                    </div>
                </div>
                <div class="timestamp">${new Date(data.timestamp).toLocaleString()}</div>
            `;
        } else {
            messageDiv.innerHTML = `
                <span class="username">${data.username}</span> wysłał plik:
                <a href="${link}" target="_blank" download="${data.file.filename}" class="file-link">${data.file.filename}</a>
                <div class="timestamp">${new Date(data.timestamp).toLocaleString()}</div>
            `;
        }
    } else {
        messageDiv.innerHTML = `
            <span class="username">${data.username}:</span> <div class="message-content">${data.message.replace(/\n/g, '<br>')}</div>
            <div class="timestamp">${new Date(data.timestamp).toLocaleString()}</div>
        `;
    }

    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});