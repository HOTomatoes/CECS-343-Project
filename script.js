const socket = io(); // Connect to the server

// Handle the "Find Game" button click
document.getElementById('findGameButton').addEventListener('click', () => {
    socket.emit('findGame'); // Emit the findGame event to the server
});

// Game canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight * 0.8; // Adjust to take most of the viewport

// Game variables
let snake = [];
let apples = []; // Array to hold multiple apples
let gridSize = 20; // Size of each square in the grid
let snakeLength = 5;

// Snake movement variables
let direction = { x: 0, y: 0 }; // Current direction of the snake
const MOVE_SPEED = gridSize; // Move by one grid cell at a time
const NUM_APPLES = 4; // Number of apples on the map

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
    console.log("Initializing game for players:", players);
}

// Initialize snake
function init() {
    // Initialize the snake in the starting position
    for (let i = 0; i < snakeLength; i++) {
        snake.push({ x: i * gridSize, y: 0 }); // Starting at the top-left
    }
    spawnApples(); // Spawn the initial apples
    gameLoop();
}

// Key event listener for movement
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'w':
        case 'W':
            if (direction.y === 0) direction = { x: 0, y: -1 }; // Move up
            break;
        case 'a':
        case 'A':
            if (direction.x === 0) direction = { x: -1, y: 0 }; // Move left
            break;
        case 's':
        case 'S':
            if (direction.y === 0) direction = { x: 0, y: 1 }; // Move down
            break;
        case 'd':
        case 'D':
            if (direction.x === 0) direction = { x: 1, y: 0 }; // Move right
            break;
    }
});

// Function to spawn apples at random positions
function spawnApples() {
    apples = []; // Reset the apples array
    for (let i = 0; i < NUM_APPLES; i++) {
        let newApple;
        do {
            newApple = {
                x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
                y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize
            };
        } while (isAppleOnSnake(newApple)); // Ensure apple does not overlap with the snake

        apples.push(newApple); // Add the new apple to the apples array
    }
}

// Check if the apple overlaps with the snake
function isAppleOnSnake(apple) {
    return snake.some(part => part.x === apple.x && part.y === apple.y);
}

// Game loop to draw the game
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    // Move the snake
    moveSnake();

    // Draw apples
    ctx.fillStyle = 'red';
    apples.forEach(apple => {
        ctx.fillRect(apple.x, apple.y, gridSize, gridSize);
    });

    // Draw snake
    ctx.fillStyle = 'green';
    snake.forEach(part => {
        ctx.fillRect(part.x, part.y, gridSize, gridSize);
    });

    // Check for apple collisions
    checkAppleCollision();

    requestAnimationFrame(gameLoop);
}

// Move the snake in the current direction
function moveSnake() {
    // Calculate new head position based on direction
    const head = { x: snake[0].x + direction.x * MOVE_SPEED, y: snake[0].y + direction.y * MOVE_SPEED };

    // Add the new head to the snake
    snake.unshift(head);

    // Remove the tail segment (unless we're growing)
    if (snake.length > snakeLength) {
        snake.pop();
    }
}

// Check for apple collision
function checkAppleCollision() {
    for (let i = apples.length - 1; i >= 0; i--) {
        if (snake[0].x === apples[i].x && snake[0].y === apples[i].y) {
            snakeLength++; // Grow the snake
            apples.splice(i, 1); // Remove the eaten apple
            spawnApples(); // Spawn a new set of apples
        }
    }
}

window.onload = init;
