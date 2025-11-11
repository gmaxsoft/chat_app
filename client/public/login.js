const socket = io();
// Login functionality
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginError = document.getElementById('loginError');
const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('Form submitted, preventing default');
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    console.log('Login attempt:', username, password ? '[PASSWORD]' : '[EMPTY]');
    if (username && password) {
        console.log('Emitting login event');
        socket.emit('login', { username, password });
    }
    else {
        console.log('Missing username or password');
    }
});
// Socket event listeners
socket.on('loginSuccess', (data) => {
    console.log('Login successful, redirecting to chat', data);
    window.location.href = '/chat.html';
});
socket.on('loginError', (error) => {
    console.log('Login error:', error);
    loginError.textContent = error;
});
