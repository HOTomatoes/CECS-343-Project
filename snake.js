// Use ES6
"use strict";

const _ = require('lodash');

// Key maps
const KEYS = {
  up: 38,
  right: 39,
  down: 40,
  left: 37
};

/*
 * Snake class
 */
class Snake {
  constructor(options) {
    _.assign(this, options);
    this.respawn();
    this.lastDirChange = Date.now();
  }

  changeDirection(key) {
    const now = Date.now();
    const throttleTime = 100;

    if (now - this.lastDirChange < throttleTime) return;

    switch (key) {
      case KEYS.up:
        if (this.dir !== 'down')
          this.dir = 'up'; break;
      case KEYS.right:
        if (this.dir !== 'left')
          this.dir = 'right'; break;
      case KEYS.down:
        if (this.dir !== 'up')
          this.dir = 'down'; break;
      case KEYS.left:
        if (this.dir !== 'right')
          this.dir = 'left'; break;
    }
    this.lastDirChange = now;
  }

  move() {
    // Update tail
    for(var i = this.tail.length-1; i >= 0; i--) {
      this.tail[i].x = (i===0) ? this.x : this.tail[i-1].x;
      this.tail[i].y = (i===0) ? this.y : this.tail[i-1].y;
    }

    // Move head
    switch(this.dir) {
      case 'right':
        this.x++; break;
      case 'left':
        this.x--; break;
      case 'up':
        this.y--; break;
      case 'down':
        this.y++; break;
    }

    // Check boundaries
    if(this.x > this.gridSize-1) this.x = 0;
    if(this.x < 0) this.x = this.gridSize-1;
    if(this.y > this.gridSize-1) this.y = 0;
    if(this.y < 0) this.y = this.gridSize-1;

    // Collission detection
    this._checkCollisions();
  }

  _checkCollisions() {
    // With other snakes (including ourselves)
    this.snakes.forEach((s) => {
        // Check if the head of this snake collides with the tail of any snake (including itself)
        s.tail.forEach((t) => {
            if (t.x === this.x && t.y === this.y) {
                this.respawn(); // The colliding snake dies
            }
        });

        // Additional check to ensure no head-to-head collision handling if not desired
        if (s !== this && s.x === this.x && s.y === this.y) {
            this.respawn();
        }
    });

    // With apples
    this.apples.forEach((a) => {
        if (a.x === this.x && a.y === this.y) {
            this._addPoint(1);
            this._addTail();
            a.respawn();
        }
    });
  }

  respawn() {
    this.tail = [];
    this.points = 0;
    this.x = Math.random() * this.gridSize | 0;
    this.y = Math.random() * this.gridSize | 0;
  }

  _addPoint(p) {
    this.points += p;
  }

  _addTail() {
    this.tail.push({x: this.x, y: this.y});
  }
}

module.exports = Snake;
