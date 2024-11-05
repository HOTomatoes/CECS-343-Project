const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Serve static files (e.g., HTML, CSS, JavaScript)
app.use(express.static('public'));

// Simple route for the home page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Store connected players
let players = [];
const MAX_PLAYERS = 4;

// Handle WebSocket connections
io.on('connection', (socket) => {
  console.log('New client connected');

  // Handle "Find Game" event
  socket.on('findGame', () => {
    if (players.length < MAX_PLAYERS) {
      // Add player to the list
      players.push(socket.id);
      console.log(`Player ${socket.id} joined. Total players: ${players.length}`);

      // Start the game when we have enough players
      if (players.length === MAX_PLAYERS) {
        console.log('Starting game...');
        io.emit('startGame', { players }); // Notify all players to start the game
      }
    } else {
      socket.emit('matchmakingFailed', { message: 'Game is full, try again later.' });
      socket.disconnect(); // Disconnect if the game is full
    }
  });

  // Remove player on disconnect
  socket.on('disconnect', () => {
    console.log(`Player ${socket.id} disconnected`);
    players = players.filter(player => player !== socket.id);
    io.emit('playerDisconnected', { id: socket.id }); // Notify others
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
