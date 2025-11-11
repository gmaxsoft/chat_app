import mysql from 'mysql';
import bcrypt from 'bcrypt';

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'chat_online'
});

// Create admin user with hashed password
async function createAdminUser() {
  const username = 'admin';
  const plainPassword = 'admin123';
  const saltRounds = 10;

  try {
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

    const query = 'INSERT INTO users (username, password) VALUES (?, ?) ON DUPLICATE KEY UPDATE password = ?';
    db.query(query, [username, hashedPassword, hashedPassword], (err, _result) => {
      if (err) {
        console.error('Error creating admin user:', err);
      } else {
        console.log(`Admin user created successfully!`);
        console.log(`Username: ${username}`);
        console.log(`Password: ${plainPassword}`);
        console.log(`Hashed password stored in database.`);
      }
      db.end();
    });
  } catch (error) {
    console.error('Error hashing password:', error);
    db.end();
  }
}

// Connect and create admin user
db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to database');
  createAdminUser();
});