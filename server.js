const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from the public folder
app.use(express.static('public'));

// Default route to serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Player queue
let queue = [];

// Handle WebSocket connections
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('joinQueue', () => {
    if (!queue.includes(socket)) {
        queue.push(socket);
    }
    console.log('Queue:', queue.map(player => player.id));

    // Check if there are enough players to start a game
    while (queue.length >= 4) {
        const gamePlayers = queue.splice(0, 4); // Take the first 4 players
        const gameId = `game_${Date.now()}_${Math.random()}`;
        const gameData = { gameId, playerIds: gamePlayers.map(player => player.id) };

        // Notify players to start the game
        gamePlayers.forEach(player => {
            player.emit('startGame', gameData);
        });

        console.log(`Game started with ID: ${gameId}`);
        }
    });

    socket.on('leaveQueue', () => {
        queue = queue.filter(player => player.id !== socket.id);
        console.log('User left the queue:', socket.id);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        queue = queue.filter(player => player.id !== socket.id);
    });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
