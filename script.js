const socket = io.connect();

// Handle "Find Game" button click
document.getElementById('findGameButton').addEventListener('click', () => {
    // Emit an event to the server to join the matchmaking queue
    socket.emit('findGame');
});

// Listen for the event to start the game
socket.on('startGame', (data) => {
    console.log('Game is starting with players:', data.players);
    // Here you would initialize the game (e.g., start game loop, display game canvas)
});

// Listen for matchmaking failure
socket.on('matchmakingFailed', (data) => {
    alert(data.message); // Show an alert if the game is full
});

// Handle player disconnection
socket.on('playerDisconnected', (data) => {
    console.log(`Player ${data.id} has disconnected.`);
});
