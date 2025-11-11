declare const io: any;
const socket = io();

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

// Socket event listeners
socket.on('loginSuccess', (data: any) => {
    console.log('Login successful, redirecting to chat', data);
    window.location.href = '/chat.html';
});

socket.on('loginError', (error: string) => {
    console.log('Login error:', error);
    loginError.textContent = error;
});