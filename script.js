const socket = io();
let timerInterval;
let timeInQueue = 0;
const queueTimerElement = document.getElementById('queueTimer');
const timeDisplay = document.getElementById('timeInQueue');
const gameCanvas = document.getElementById('gameCanvas');
const findGameButton = document.getElementById('findGameButton');
const gameContainer = document.getElementById('gameContainer');
let inQueue = false; // Track whether the player is in the queue

// Show the game container
function showGameContainer() {
    gameContainer.style.display = 'block';
}

// Start the queue timer
function startQueueTimer() {
    timeInQueue = 0;
    queueTimerElement.style.display = 'block';
    timerInterval = setInterval(() => {
        timeInQueue++;
        timeDisplay.textContent = timeInQueue;
    }, 1000);
}

// Stop the queue timer
function stopQueueTimer() {
    clearInterval(timerInterval);
    queueTimerElement.style.display = 'none';
}

// Handle the "Find Game" button click
findGameButton.addEventListener('click', () => {
    if (inQueue) {
        // If already in queue, do not allow another click
        return;
    }

    socket.emit('findGame'); // Emit the findGame event to the server
    startQueueTimer(); // Start the queue timer
    findGameButton.style.display = 'none'; // Hide the button once clicked
    inQueue = true; // Set the flag to true indicating the player is now in the queue
});

// When the game starts
socket.on('startGame', (data) => {
    stopQueueTimer(); // Stop the queue timer
    queueTimerElement.style.display = 'none'; // Hide the queue timer
    gameCanvas.style.display = 'block'; // Show the game canvas
    initGame(data.players); // Initialize the game with players
    inQueue = false; // Reset the inQueue flag
});

// Handle matchmaking failure
socket.on('matchmakingFailed', (data) => {
    alert(data.message);
    stopQueueTimer(); // Stop the timer if matchmaking fails
    queueTimerElement.style.display = 'none'; // Hide the queue timer
    findGameButton.style.display = 'block'; // Show the find game button again
    inQueue = false; // Reset the inQueue flag
});

// Countdown function and game start
socket.on('startGameCountdown', () => {
    countdown(3); // Start a 3-second countdown before the game starts
});
