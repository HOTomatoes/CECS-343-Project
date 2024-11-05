const socket = io();

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight * 0.8; // Adjust to take most of the viewport

// Game variables
let snake = [];
let apple = {};
let gridSize = 20; // Size of each square in the grid
let snakeLength = 5;

// When the game starts
socket.on('startGame', (data) => {
    console.log('Game is starting with players:', data.players);
    initGame(data.players);
});

// Handle a player disconnecting
socket.on('playerDisconnected', (data) => {
    console.log(`Player ${data.id} has left the game`);
    // Update game state accordingly
});

// Matchmaking failure
socket.on('matchmakingFailed', (data) => {
    alert(data.message);
});

// Function to initialize the game with players
function initGame(players) {
    init(); // Initialize the game
    // Here you can initialize the snakes based on the players array
    console.log("Initializing game for players:", players);
}

// Initialize snake
function init() {
    for (let i = 0; i < snakeLength; i++) {
        snake.push({ x: i * gridSize, y: 0 }); // Starting at the top-left
    }
    spawnApple();
    gameLoop();
}

function spawnApple() {
    apple.x = Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize;
    apple.y = Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize;
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    // Draw apple
    ctx.fillStyle = 'red';
    ctx.fillRect(apple.x, apple.y, gridSize, gridSize);

    // Draw snake
    ctx.fillStyle = 'green';
    snake.forEach(part => {
        ctx.fillRect(part.x, part.y, gridSize, gridSize);
    });

    // Move snake logic (add your movement logic here)

    requestAnimationFrame(gameLoop);
}

window.onload = init;
