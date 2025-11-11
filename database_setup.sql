-- Skrypt do skonfigurowania bazy danych MySQL dla aplikacji chat

CREATE DATABASE IF NOT EXISTS chat_online;
USE chat_online;

-- Tabela użytkowników
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- W aplikacji produkcyjnej hasła powinny być hashowane
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela wiadomości
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    room VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_room_timestamp (room, timestamp)
);

-- Przykładowi użytkownicy (do celów testowych)
INSERT INTO users (username, password) VALUES
('user1', 'pass1'),
('user2', 'pass2'),
('user3', 'pass3')
ON DUPLICATE KEY UPDATE username=username;