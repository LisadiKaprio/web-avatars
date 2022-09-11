"use strict";

class Avatar {
  constructor(config) {
    // username
    this.name = config.name === undefined ? "NoName" : config.name;
    // define and pass in position, or else default to 0
    this.x = config.x || 0;
    this.y = config.y || 950;
    this.toRemove = false;
    this.color = config.color || "black";
    // define sprite
    this.sprite = new Sprite({
      gameObject: this,
      src: config.src,
      mask: config.mask,
      color: this.color,
      displaySize: config.displaySize || 150,
      animations: config.animations || {
        idle: ANIMATIONS.idle,
        talk: ANIMATIONS.talk,
        gain: ANIMATIONS.gain,
        consume: ANIMATIONS.consume,
        hug: ANIMATIONS.hug,
      },
      // "bonk give left": [ [2,0], [0,5], [1,5], [0,5], [2,0] ],
      // "bonk receive left": [ [0,1], [1,1], [2,5], [3,5], [0,6], [1,6], [2,6], [1,6], [2,6], [1,6], [2,6]],
    });

    this.actionTime = config.actionTime === undefined ? 24 : config.actionTime;
    this.speed = config.speed || 1.0;

    this.walkingTime = config.walkingTime || 300;
    this.standTime = config.standTime || 500;
    // default direction
    this.direction = "left";

    // Behaviour is a series of actions or other behaviours
    // Motivation is a stack of behaviours that the caracter wants to do
    this.idleBehaviour = BEHAVIOURS.idle;

    this.motivation = [];
    this.currentBehaviour = config.behaviourLoop || this.idleBehaviour;
    this.behaviourLoopIndex = 0;

    this.isActive = true;
    this.lastChatTime = config.time;
  }

  update() {
    this.actionTime -= 1;
    if (this.actionTime <= 0) {
      this.advanceBehaviour();
    }
    let action = this.currentBehaviour.actions[this.behaviourLoopIndex];
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
    } else if (action.type == "go") {
      // TODO: only done for x.
      const deltaX = action.x - this.x;
      if (deltaX > this.speed + 0.1) {
        this.x += this.speed;
      } else if (deltaX < -(this.speed + 0.1)) {
        this.x -= this.speed;
      } else {
        this.x = action.x;
        this.actionTime = 1;
      }
    }
  }

  draw(ctx) {
    this.sprite.draw(ctx);
    ctx.fillStyle = this.color;
    ctx.fillText(
      this.name,
      this.x + this.sprite.displaySize / 2,
      this.y + this.sprite.displaySize + 3
    );
  }

  endAnimation() {
    // Animation that doesn't loop has ended
    // motivation doesn't necessarily has to end?
    this.popMotivation();
  }

  pushMotivation(behaviour) {
    // check for the ordering

    // most urgent behaviours don't get swapped out
    if (
      this.currentBehaviour.name == "hug" ||
      this.currentBehaviour.name == "hugged"
    ) {
      this.motivation.push(behaviour);
      return;
    }

    // instant actions
    // swap current behaviour to talk or hug immediately
    if (behaviour.name == "talk" || behaviour.name == "hug") {
      // didn't finish action, do it later
      this.motivation.push(this.currentBehaviour);
      this.changeBehaviour(behaviour);
      return;
    } else if (this.currentBehaviour.name == "idle") {
      // idle is the least urgent behaviour.
      this.motivation.push(this.currentBehaviour);
      this.changeBehaviour(behaviour);
      return;
    } // other cases where we need to decide to swap or not...

    // don't swap by default
    this.motivation.push(behaviour);
  }

  popMotivation() {
    if (this.motivation.length <= 0) {
      this.pushMotivation(this.idleBehaviour);
    }
    this.changeBehaviour(this.motivation.pop());
  }

  changeBehaviour(behaviour) {
    this.currentBehaviour = behaviour;
    this.behaviourLoopIndex = -1;
    this.advanceBehaviour();
  }

  advanceBehaviour() {
    this.behaviourLoopIndex += 1;
    if (this.behaviourLoopIndex >= this.currentBehaviour.actions.length) {
      // try to do the next thing.
      this.popMotivation();
      return;
    }

    let action = this.currentBehaviour.actions[this.behaviourLoopIndex];
    this.sprite.setAnimation("idle");
    if (action.type == "walk") {
      this.actionTime = Math.random() * this.walkingTime;
      this.direction = action.direction;
    } else if (action.type == "stand") {
      this.actionTime = Math.random() * this.standTime;
    } else if (action.type == "talk") {
      // play out all the frames of animation, then animation advances to next behaviour
      this.sprite.setAnimation("talk");
      this.actionTime = 9999;
    } else if (action.type == "hug") {
      const whoToHug = action.who;
      // TODO: only done for x.
      const distance = whoToHug.x - this.x;
      // half of this sprite and half of the other sprite
      const padding =
        (this.sprite.displaySize + whoToHug.sprite.displaySize) / 3;
      if (Math.abs(distance) > padding) {
        // need to go closer to who we want to hug.
        // TODO: if too close maybe need to step away a little bit.
        this.actionTime = 100;
        this.currentBehaviour.insert(this.behaviourLoopIndex, {
          type: "go",
          x: whoToHug.x - padding * Math.sign(distance),
          y: whoToHug.y,
        });
      } else {
        if (whoToHug.currentBehaviour.name != "hug") {
          // close enough for a hug, change animation of this and the other
          this.sprite.setAnimation("hug");
          this.actionTime = 100;
          const oppositeDirection = this.direction == "left" ? "right" : "left";
          whoToHug.changeBehaviour(
            new Behaviour("hugged", [{ type: "hugged" }])
          );
        } else {
          this.actionTime = 50;
          this.currentBehaviour.insert(this.behaviourLoopIndex, {
            type: "stand",
          });
        }
        // TODO: wait if who we want to hug is doing something
      }
    } else if (action.type == "hugged") {
      this.sprite.setAnimation("hug");
      this.actionTime = 100;
    } else if (action.type == "go") {
      this.actionTime = 100;
    }
  }
}

const ACTIONS = {
  walk: "walk", // direction: "left" || "right"
  stand: "stand",
  talk: "talk",
  go: "go", // x: 0, y: 0
  hug: "hug", // who: Avatar
  hugged: "hugged",
};

class Behaviour {
  constructor(name, actions) {
    this.name = name;
    this.actions = actions;
  }

  shift() {
    this.actions.shift();
  }

  unshift(action) {
    this.actions.unshift(action);
  }

  insert(place, action) {
    this.actions.splice(place, 0, action);
  }

  get length() {
    return this.actions.length;
  }

  dbg() {
    return `${this.name} (${this.actions
      .map((action) => action.type)
      .join(", ")})`;
  }
}

const BEHAVIOURS = {
  idle: new Behaviour("idle", [
    { type: "walk", direction: "left" },
    { type: "stand" },
    { type: "walk", direction: "right" },
    { type: "stand" },
  ]),
  talk: new Behaviour("talk", [{ type: ACTIONS.talk }]),
  sleep: new Behaviour("sleep", [{ type: ACTIONS.stand }]),
};
