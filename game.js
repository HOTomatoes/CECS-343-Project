const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight * 0.8; // Adjust to take most of the viewport

// Game variables
let snake = [];
let apples = [];
const gridSize = 20; // Size of each square in the grid
let snakeLength = 5;
let direction = { x: gridSize, y: 0 }; // Initial direction: moving right
let gameOver = false;

// Initialize the game
function initGame(players) {
    // Initialize snake and apple positions
    for (let i = 0; i < snakeLength; i++) {
        snake.push({ x: i * gridSize, y: 0 }); // Starting at the top-left
    }
    spawnApples();
    gameLoop();
}

// Spawn apples
function spawnApples() {
    apples = []; // Reset apples array
    for (let i = 0; i < 4; i++) { // Always keep 4 apples
        let apple = {};
        apple.x = Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize;
        apple.y = Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize;
        apples.push(apple);
    }
}

// Game loop
function gameLoop() {
    if (gameOver) {
        alert("Game Over!");
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    // Draw grid lines
    drawGrid();

    // Draw apples
    ctx.fillStyle = 'red';
    apples.forEach(apple => {
        ctx.fillRect(apple.x, apple.y, gridSize, gridSize);
    });

    // Move the snake
    moveSnake();

    // Draw snake
    ctx.fillStyle = 'green';
    snake.forEach(part => {
        ctx.fillRect(part.x, part.y, gridSize, gridSize);
    });

    // Check for collisions
    checkCollisions();

    requestAnimationFrame(gameLoop);
}

// Function to draw the grid
function drawGrid() {
    ctx.strokeStyle = '#ccc'; // Color of the grid lines
    ctx.lineWidth = 1; // Width of the grid lines

    // Draw vertical lines
    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// Function to handle snake movement
function moveSnake() {
    const newHead = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };

    // Add new head to the snake
    snake.unshift(newHead);

    // Check if snake has eaten an apple
    if (checkAppleCollision(newHead)) {
        snakeLength++; // Increase the snake's length
        spawnApples(); // Respawn apples
    }

    // Remove the last part of the snake unless we've eaten an apple
    if (snake.length > snakeLength) {
        snake.pop();
    }
}

// Check for apple collisions
function checkAppleCollision(head) {
    for (let i = 0; i < apples.length; i++) {
        if (head.x === apples[i].x && head.y === apples[i].y) {
            apples.splice(i, 1); // Remove the apple from the array
            return true; // Collision detected
        }
    }
    return false; // No collision
}

// Function to check for collisions
function checkCollisions() {
    const head = snake[0];

    // Check for wall collisions (optional)
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
        gameOver = true; // Game over if snake hits the wall
    }

    // Check for self-collision
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver = true; // Game over if snake collides with itself
        }
    }

    // Check for player collision (additional logic needed for multiplayer)
}

// Handle key presses for movement
window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'w': // Move up
            if (direction.y === 0) {
                direction = { x: 0, y: -gridSize };
            }
            break;
        case 'a': // Move left
            if (direction.x === 0) {
                direction = { x: -gridSize, y: 0 };
            }
            break;
        case 's': // Move down
            if (direction.y === 0) {
                direction = { x: 0, y: gridSize };
            }
            break;
        case 'd': // Move right
            if (direction.x === 0) {
                direction = { x: gridSize, y: 0 };
            }
            break;
    }
});

// Function to handle head-on collisions (multiplayer logic needed)
function handleHeadOnCollision(otherSnake) {
    if (snake.length > otherSnake.length) {
        // Current snake wins, remove other snake
    } else {
        // Other snake wins, remove current snake
        gameOver = true; // Game over for the current player
    }
}
