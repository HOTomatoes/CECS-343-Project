const socket = io();
let timerInterval;
let timeInQueue = 0;
const queueTimerElement = document.getElementById('queueTimer');
const timeDisplay = document.getElementById('timeInQueue');
const gameCanvas = document.getElementById('gameCanvas');
const findGameButton = document.getElementById('findGameButton');
const cancelSearchButton = document.getElementById('cancelSearchButton');
const gameContainer = document.getElementById('gameContainer');
let inQueue = false; // Track whether the player is in the queue

// Ensure the game container, queue timer, and cancel search button are hidden initially
gameContainer.style.display = 'none';
queueTimerElement.style.display = 'none';
cancelSearchButton.style.display = 'none';

// Show the game container and queue timer when player clicks "Find Game"
function showGameContainer() {
    gameContainer.style.display = 'block'; // Show the game container
    queueTimerElement.style.display = 'block'; // Show the queue timer
    cancelSearchButton.style.display = 'block'; // Show the cancel search button
}

// Start the queue timer
function startQueueTimer() {
    timeInQueue = 0;
    timerInterval = setInterval(() => {
        timeInQueue++;
        timeDisplay.textContent = timeInQueue;
    }, 1000);
}

// Stop the queue timer and hide it
function stopQueueTimer() {
    clearInterval(timerInterval);
    queueTimerElement.style.display = 'none';
    cancelSearchButton.style.display = 'none';
}

// Handle the "Find Game" button click
findGameButton.addEventListener('click', () => {
    if (inQueue) return; // Prevent re-queueing if already in queue

    socket.emit('findGame'); // Emit the findGame event to the server
    showGameContainer(); // Show game container and timer
    startQueueTimer(); // Start the queue timer
    findGameButton.style.display = 'none'; // Hide the find game button once clicked
    inQueue = true; // Set the flag to true indicating the player is now in the queue
});

// Handle the "Cancel Search" button click
cancelSearchButton.addEventListener('click', () => {
    socket.emit('cancelSearch'); // Emit the cancelSearch event to the server (you'll need to handle this server-side)
    stopQueueTimer(); // Stop the queue timer
    findGameButton.style.display = 'block'; // Show the find game button again
    inQueue = false; // Reset the inQueue flag
});

// When the game starts
socket.on('startGame', (data) => {
    stopQueueTimer(); // Stop the queue timer
    gameCanvas.style.display = 'block'; // Show the game canvas
    initGame(data.players); // Initialize the game with players
    inQueue = false; // Reset the inQueue flag
});

// Handle matchmaking failure
socket.on('matchmakingFailed', (data) => {
    alert(data.message);
    stopQueueTimer(); // Stop the timer if matchmaking fails
    findGameButton.style.display = 'block'; // Show the find game button again
    inQueue = false; // Reset the inQueue flag
});

// Countdown function and game start
socket.on('startGameCountdown', () => {
    countdown(3); // Start a 3-second countdown before the game starts
});
