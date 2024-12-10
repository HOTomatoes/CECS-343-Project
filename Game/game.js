Game = function(game) {}

Game.prototype = {
    preload: function() {
        // Load assets
        this.game.load.image('red-circle','assets/red-circle.png');
        this.game.load.image('yellow-circle','assets/yellow-circle.png');
        this.game.load.image('green-circle','assets/green-circle.png');
        this.game.load.image('blue-circle','assets/blue-circle.png');
        this.game.load.image('shadow', 'assets/white-shadow.png');
        this.game.load.image('background', 'assets/tile.png');
        this.game.load.image('eye-white', 'assets/eye-white.png');
        this.game.load.image('eye-black', 'assets/eye-black.png');
        this.game.load.image('food', 'assets/hex.png');
    },
    create: function(gameData) {
        const { playerIds, playerId, players } = gameData;
        const width = this.game.width;
        const height = this.game.height;

        // Set world bounds and background
        this.game.world.setBounds(-width, -height, width * 2, height * 2);
        this.game.stage.backgroundColor = '#444';
        const background = this.game.add.tileSprite(-width, -height,
            this.game.world.width, this.game.world.height, 'background');

        // Initialize physics and groups
        this.game.physics.startSystem(Phaser.Physics.P2JS);
        this.foodGroup = this.game.add.group();
        this.snakeHeadCollisionGroup = this.game.physics.p2.createCollisionGroup();
        this.foodCollisionGroup = this.game.physics.p2.createCollisionGroup();

        // Add food
        for (let i = 0; i < 100; i++) {
            this.initFood(Util.randomInt(-width, width), Util.randomInt(-height, height));
        }

        this.game.snakes = [];

        // Define spawn positions and angles for players
        const spawnData = [
            { x: -width / 2, y: -height / 2, angle: 45 },
            { x: width / 2, y: -height / 2, angle: 135 },
            { x: width / 2, y: height / 2, angle: -135 },
            { x: -width / 2, y: height / 2, angle: -45 }
        ];

        // Spawn players
        players.forEach((player, index) => {
            const spawn = spawnData[index % spawnData.length];
            const snake = player.id === playerId
                ? new PlayerSnake(this.game, player.color, spawn.x, spawn.y)
                : new Snake(this.game, player.color, spawn.x, spawn.y);

            // Rotate snake to face the center
            snake.head.body.rotation = Phaser.Math.degToRad(spawn.angle);

            if (player.id === playerId) {
                this.game.camera.follow(snake.head);
            }

            this.game.snakes.push(snake);
        });

        // Initialize collision groups for all snakes
        this.game.snakes.forEach((snake) => {
            snake.head.body.setCollisionGroup(this.snakeHeadCollisionGroup);
            snake.head.body.collides([this.foodCollisionGroup]);
            snake.addDestroyedCallback(this.snakeDestroyed, this);
        });
    },
    update: function() {
        // Update game components
        for (let i = this.game.snakes.length - 1; i >= 0; i--) {
            this.game.snakes[i].update();
        }
        for (let i = this.foodGroup.children.length - 1; i >= 0; i--) {
            const f = this.foodGroup.children[i];
            f.food.update();
        }
    },
    initFood: function(x, y) {
        const f = new Food(this.game, x, y);
        f.sprite.body.setCollisionGroup(this.foodCollisionGroup);
        this.foodGroup.add(f.sprite);
        f.sprite.body.collides([this.snakeHeadCollisionGroup]);
        return f;
    },
    snakeDestroyed: function(snake) {
        // Place food where the snake was destroyed
        for (let i = 0; i < snake.headPath.length;
            i += Math.round(snake.headPath.length / snake.snakeLength) * 2) {
            this.initFood(
                snake.headPath[i].x + Util.randomInt(-10, 10),
                snake.headPath[i].y + Util.randomInt(-10, 10)
            );
        }
    }
};
