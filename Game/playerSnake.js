/**
 * Player of the core snake for controls
 * @param  {Phaser.Game} game      game object
 * @param  {String} spriteKey Phaser sprite key
 * @param  {Number} x         coordinate
 * @param  {Number} y         coordinate
 * @param  {Object} socket    Socket.io instance
 */
PlayerSnake = function(game, spriteKey, x, y, socket) {
    Snake.call(this, game, spriteKey, x, y);
    this.socket = socket; // Save the socket reference
    this.cursors = game.input.keyboard.createCursorKeys();

    // Handle the space key so that the player's snake can speed up
    const spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    spaceKey.onDown.add(this.spaceKeyDown, this);
    spaceKey.onUp.add(this.spaceKeyUp, this);
    this.addDestroyedCallback(() => {
        spaceKey.onDown.remove(this.spaceKeyDown, this);
        spaceKey.onUp.remove(this.spaceKeyUp, this);
    }, this);

    // Listen for updates from the server
    this.socket.on('updatePosition', (data) => {
        const snake = this.game.snakes.find(s => s.id === data.playerId);
        if (snake) {
            snake.head.body.x = data.position.x;
            snake.head.body.y = data.position.y;
        }
    });
};

PlayerSnake.prototype = Object.create(Snake.prototype);
PlayerSnake.prototype.constructor = PlayerSnake;

// Make this snake light up and speed up when the space key is down
PlayerSnake.prototype.spaceKeyDown = function() {
    this.speed = this.fastSpeed;
    this.shadow.isLightingUp = true;
};

// Make the snake slow down when the space key is up again
PlayerSnake.prototype.spaceKeyUp = function() {
    this.speed = this.slowSpeed;
    this.shadow.isLightingUp = false;
};

/**
 * Add functionality to the original snake update method so that the player
 * can control where this snake goes
 */
PlayerSnake.prototype.tempUpdate = PlayerSnake.prototype.update;
PlayerSnake.prototype.update = function() {
    // Emit player position
    const position = { x: this.head.body.x, y: this.head.body.y };
    this.socket.emit('updatePosition', { playerId: this.socket.id, position });

    // Find the angle that the head needs to rotate through to face the mouse
    const mousePosX = this.game.input.activePointer.worldX;
    const mousePosY = this.game.input.activePointer.worldY;
    const headX = this.head.body.x;
    const headY = this.head.body.y;
    let angle = (180 * Math.atan2(mousePosX - headX, mousePosY - headY) / Math.PI);
    if (angle > 0) {
        angle = 180 - angle;
    } else {
        angle = -180 - angle;
    }
    const dif = this.head.body.angle - angle;
    this.head.body.setZeroRotation();

    // Allow arrow keys to be used
    if (this.cursors.left.isDown) {
        this.head.body.rotateLeft(this.rotationSpeed);
    } else if (this.cursors.right.isDown) {
        this.head.body.rotateRight(this.rotationSpeed);
    } else if (dif < 0 && dif > -180 || dif > 180) {
        this.head.body.rotateRight(this.rotationSpeed);
    } else if (dif > 0 && dif < 180 || dif < -180) {
        this.head.body.rotateLeft(this.rotationSpeed);
    }

    // Call the original snake update method
    this.tempUpdate();
};
