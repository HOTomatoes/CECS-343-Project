// Use ES6
"use strict";

// Express & Socket.io deps
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const _ = require('lodash');

const Snake = require('./snake');
const Apple = require('./apple');

// ID's seed
let autoId = 0;
// Grid size
const GRID_SIZE = 40;
// Remote players 🐍
let players = [];
// Apples 🍎
let apples = [];
// Game state
let gameStarted = false;

/*
 * Serve client
 */
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});

/*
 * Listen for incoming clients
 */
io.on('connection', (client) => {
  let player;
  let id;

  client.on('auth', (opts, cb) => {
    // Create player
    id = ++autoId;
    player = new Snake(_.assign({
      id,
      dir: 'right',
      gridSize: GRID_SIZE,
      snakes: players,
      apples
    }, opts));
    players.push(player);
    console.log(`${opts.nickname} joined the game! Total players: ${players.length}`);

    // Notify all clients about the current player count
    io.emit('playerCount', players.length);

    // Start the game if enough players
    if (players.length >= 6 && !gameStarted) {
      console.log("Enough players! Starting the game...");
      gameStarted = true;
      startGameLoop();
    }

    // Callback with id
    cb({ id: autoId });
  });

  // Receive keystrokes
  client.on('key', (key) => {
    // and change direction accordingly
    if (player) {
      player.changeDirection(key);
    }
  });

  // Remove players on disconnect
  client.on('disconnect', () => {
    _.remove(players, player);
    console.log(`${player.nickname || 'A player'} disconnected. Remaining players: ${players.length}`);

    // Notify all clients about the updated player count
    io.emit('playerCount', players.length);

    // Stop the game if players drop below 4
    if (players.length < 4) {
      console.log("Not enough players. Stopping the game...");
      gameStarted = false;
    }
  });
});

// Create apples
for (let i = 0; i < 3; i++) {
  apples.push(new Apple({
    gridSize: GRID_SIZE,
    snakes: players,
    apples
  }));
}

// Game loop
function startGameLoop() {
  setInterval(() => {
    if (!gameStarted) return; // Skip updating if game not started

    players.forEach((p) => {
      p.move();
    });

    io.emit('state', {
      players: players.map((p) => ({
        x: p.x,
        y: p.y,
        id: p.id,
        nickname: p.nickname,
        points: p.points,
        tail: p.tail
      })),
      apples: apples.map((a) => ({
        x: a.x,
        y: a.y
      }))
    });
  }, 100);
}
