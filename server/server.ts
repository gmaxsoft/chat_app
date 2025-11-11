import express from 'express';
import http from 'http';
import socketIo from 'socket.io';
import mysql from 'mysql';
import multer from 'multer';
import path from 'path';
import bcrypt from 'bcrypt';

const app = express();
const server = http.createServer(app);
const io = new socketIo.Server(server);

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'chat_online'
});

db.connect((err: any) => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

// Multer for file uploads
const storage = multer.diskStorage({
  destination: './server/uploads/',
  filename: (_req: any, file: any, cb: any) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

app.use(express.json());

// Middleware to check authentication for protected routes
app.use('/chat.html', (_req: any, res: any, _next: any) => {
  // For simplicity, we'll just redirect to login
  // In a real app, you'd check JWT tokens or session cookies
  console.log('Access to chat.html, redirecting to login');
  res.redirect('/login.html');
});

// Root route redirect
app.get('/', (_req: any, res: any) => {
  console.log('Access to root, redirecting to login');
  res.redirect('/login.html');
});

app.use(express.static(path.join(__dirname, '../../client/public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Socket.IO connections
io.on('connection', (socket: any) => {
  console.log('User connected:', socket.id);

  // Simple login
  socket.on('login', (data: any) => {
    const { username, password } = data;
    console.log('Login attempt for user:', username);
    // Authentication with password hashing
    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], async (err: any, results: any) => {
      if (err) {
        console.error('Database error:', err);
        return socket.emit('loginError', 'Database error');
      }
      console.log('Database query results:', results.length, 'users found');
      if (results.length > 0) {
        const user = results[0];
        console.log('Found user:', user.username, 'checking password...');
        try {
          const isValidPassword = await bcrypt.compare(password, user.password);
          console.log('Password validation result:', isValidPassword);
          if (isValidPassword) {
            (socket as any).username = username;
            console.log('Login successful for:', username);
            socket.emit('loginSuccess', { username, redirect: '/chat.html' });
          } else {
            console.log('Invalid password for:', username);
            socket.emit('loginError', 'Invalid credentials');
          }
        } catch (hashErr) {
          console.error('Hash error:', hashErr);
          socket.emit('loginError', 'Authentication error');
        }
      } else {
        console.log('User not found:', username);
        socket.emit('loginError', 'Invalid credentials');
      }
    });
  });

  // Join room
  socket.on('joinRoom', (roomName: any) => {
    console.log('User joining room:', roomName, 'username:', (socket as any).username);
    socket.join(roomName);
    socket.emit('joinedRoom', roomName);
    socket.to(roomName).emit('userJoined', (socket as any).username);
  });

  // Leave room
  socket.on('leaveRoom', (roomName: any) => {
    console.log('User leaving room:', roomName, 'username:', (socket as any).username);
    socket.leave(roomName);
    socket.to(roomName).emit('userLeft', (socket as any).username);
  });

  // Send message
  socket.on('sendMessage', (data: any) => {
    const { room, message, username } = data;
    console.log('Send message:', { username: username || (socket as any).username, room, message });

    const finalUsername = username || (socket as any).username;
    if (!finalUsername) {
      console.error('No username available for message');
      return;
    }

    io.to(room).emit('newMessage', { username: finalUsername, message, timestamp: new Date() });
    // Optionally save to DB
    const query = 'INSERT INTO messages (username, room, message, timestamp) VALUES (?, ?, ?, ?)';
    db.query(query, [finalUsername, room, message, new Date()], (err: any) => {
      if (err) console.error('Database error saving message:', err);
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// File upload endpoint
app.post('/upload', upload.single('file'), (req: any, res: any) => {
  if (!req.file) return res.status(400).send('No file uploaded');
  res.json({ filename: req.file.filename, filepath: `/uploads/${req.file.filename}` });
});

const PORT = process.env['PORT'] || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});