"use strict";

class Emote {
  constructor(config) {
    this.x = config.x || 0;
    this.y = config.y || 950;

    this.speedPhysicsX = config.speedPhysicsX || Math.random() * 6 - 3;
    this.speedPhysicsY = config.speedPhysicsY || -(Math.random() * 5);
    this.dragPhysicsY = config.dragPhysicsY || -0.02;

    this.sprite = new Sprite({
      gameObject: this,
      src: config.src,
      mask: config.mask,
      color: this.color,
    });
  }

  update() {
    this.x += this.speedPhysicsX;
    //this.speedPhysicsX += this.accelerationPhysicsX;

    this.y += this.speedPhysicsY;
    this.speedPhysicsY -= this.dragPhysicsY;
  }
}

class Avatar {
  constructor(config) {
    // username
    this.name = config.name === undefined ? "NoName" : config.name;
    // define and pass in position, or else default to 0
    this.x = config.x || 0;
    this.y = config.y || 950;
    this.color = config.color || "black";
    // define sprite
    this.sprite = new Sprite({
      gameObject: this,
      src: config.src,
      mask: config.mask,
      color: this.color,
      animations: config.animations || {
        idle: new Animation({
          frames: [
            [0, 0],
            [1, 0],
          ],
          doesLoop: true,
        }),
        talking: new Animation({
          frames: [
            //[0,1],
            [1, 1],
            [2, 1], // begin talking
            [0, 2],
            [1, 2],
            [0, 2],
            [1, 2],
            [0, 2],
            [1, 2],
            [0, 2],
            [1, 2],
            [0, 2],
            [1, 2],
            [0, 2],
            [1, 2],
            [0, 2],
            [1, 2], // talking
            [2, 1],
            [1, 1],
            [0, 1],
          ], // stop talking
          doesLoop: false,
        }),

        // "begin talking": [ [1,0], [1,1], [1,2] ],
        // "talking": [ [2,0], [2,1] ],
        // "stop talking": [ [1,2], [1,1], [1,0] ],

        // "begin gaining item": [ [1,0], [1,1], [1,3] ],
        // "gaining item": [ [2,2], [2,3] ],
        // "stop gaining item": [ [1,3], [1,1], [1,0] ],

        // "consuming item": [ [0,2], [3,0], [3,1], [3,2], [3,3], [3,2], [3,1], [3,0], [0,2],],

        // "hugging left": [ [4,0], [4,1] ],
        // "hugging right": [ [4,2], [4,3] ],
      },
    });

    this.actionTime = config.actionTime === undefined ? 24 : config.actionTime;
    this.speed = config.speed || 1;

    this.walkingTime = config.walkingTime || 300;
    this.standTime = config.standTime || 500;
    // default direction
    this.direction = "left";

    this.behaviours = {
      idle: [
        { type: "walk", direction: "left" },
        { type: "stand" },
        { type: "walk", direction: "right" },
        { type: "stand" },
      ],
      talk: [{ type: "talking" }],
    };

    // https://www.youtube.com/watch?v=e144CXGy2mc part 8
    this.behaviourLoop = config.behaviourLoop || this.behaviours["idle"];
    this.behaviourLoopIndex = 0;
  }

  changeBehaviour(behaviour) {
    if (behaviour) {
      this.behaviourLoop = this.behaviours[behaviour];
    } else {
      this.behaviourLoop = this.behaviours.idle;
    }
    this.behaviourLoopIndex = 0;
  }

  advanceBehaviour() {
    this.behaviourLoopIndex += 1;
    if (this.behaviourLoopIndex >= this.behaviourLoop.length) {
      this.behaviourLoopIndex = 0;
    }

    let action = this.behaviourLoop[this.behaviourLoopIndex];
    if (action.type == "walk") {
      this.actionTime = Math.random() * this.walkingTime;
      this.direction = action.direction;
    } else if (action.type == "stand") {
      this.actionTime = Math.random() * this.standTime;
    } else if (action.type === "talking") {
      // play out all the frames of animation, then switch to next behavior
      this.sprite.currentAnimation = "talking";
      this.actionTime = 1000;
    }
  }

  update() {
    this.actionTime -= 1;
    if (this.actionTime <= 0) {
      this.advanceBehaviour();
    }
    let action = this.behaviourLoop[this.behaviourLoopIndex];
    if (action.type == "walk") {
      if (this.x >= 1920 - 150) {
        this.direction = "left";
      }
      if (this.x <= 0) {
        this.direction = "right";
      }
      if (this.direction == "left") {
        this.x -= this.speed;
      } else if (this.direction == "right") {
        this.x += this.speed;
      }
    }
  }
}
