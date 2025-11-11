// Get username from URL parameters or localStorage
const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get('user') || localStorage.getItem('chat_username');
if (!username) {
    // Redirect to login if no username
    window.location.href = '/login.html';
}
const socket = io();
let currentRoom = null;
// Chat functionality
const roomBtns = document.querySelectorAll('.room-btn');
const currentRoomDiv = document.getElementById('currentRoom');
const messagesDiv = document.getElementById('messages');
const messageEditor = document.getElementById('messageEditor');
const boldBtn = document.getElementById('boldBtn');
const italicBtn = document.getElementById('italicBtn');
const underlineBtn = document.getElementById('underlineBtn');
const clearBtn = document.getElementById('clearBtn');
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
    if (!currentRoom) {
        alert('Wybierz pokój przed wysłaniem wiadomości!');
        return;
    }
    if (message) {
        socket.emit('sendMessage', { room: currentRoom, message, username });
        messageEditor.innerHTML = '';
    }
});
// Allow sending message with Ctrl+Enter
messageEditor.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault(); // Prevent default behavior
        const message = messageEditor.innerHTML.trim();
        if (!currentRoom) {
            alert('Wybierz pokój przed wysłaniem wiadomości!');
            return;
        }
        if (message) {
            socket.emit('sendMessage', { room: currentRoom, message, username });
            messageEditor.innerHTML = '';
        }
    }
});
// Send file
fileInput.addEventListener('change', (e) => {
    var _a;
    const target = e.target;
    const file = (_a = target.files) === null || _a === void 0 ? void 0 : _a[0];
    if (!currentRoom) {
        alert('Wybierz pokój przed wysłaniem pliku!');
        target.value = '';
        return;
    }
    if (file) {
        const formData = new FormData();
        formData.append('file', file);
        fetch('/upload', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
            socket.emit('sendMessage', { room: currentRoom, message: `[Plik: ${file.name}]`, file: data, username });
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
        }
        else {
            messageDiv.innerHTML = `
                <span class="username">${data.username}</span> wysłał plik:
                <a href="${link}" target="_blank" download="${data.file.filename}" class="file-link">${data.file.filename}</a>
                <div class="timestamp">${new Date(data.timestamp).toLocaleString()}</div>
            `;
        }
    }
    else {
        messageDiv.innerHTML = `
            <span class="username">${data.username}:</span> <div class="message-content">${data.message.replace(/\n/g, '<br>')}</div>
            <div class="timestamp">${new Date(data.timestamp).toLocaleString()}</div>
        `;
    }
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});
