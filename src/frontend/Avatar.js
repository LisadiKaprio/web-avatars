"use strict";

class Avatar {
  constructor(world, config) {
    // username
    this.name = config.name === undefined ? "NoName" : config.name;
    this.displayName =
      config.displayName === undefined ? "NoName" : config.displayName;
    this.world = world;
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
        bonk: ANIMATIONS.bonk,
        bonked: ANIMATIONS.bonked,
      },
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
    if (action.type == ACTIONS.walk) {
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
    } else if (action.type == ACTIONS.go) {
      const speedMultiplier = 2.0;
      // TODO: only done for x.
      const deltaX = action.x - this.x;
      if (deltaX > this.speed * speedMultiplier + 0.1) {
        this.x += this.speed * speedMultiplier;
      } else if (deltaX < -(this.speed * speedMultiplier + 0.1)) {
        this.x -= this.speed * speedMultiplier;
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
      this.displayName,
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
    if (!this.canSwapBehaviour()) {
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
    if (action.type == ACTIONS.walk) {
      this.actionTime = Math.random() * this.walkingTime;
      this.direction = action.direction;
    } else if (action.type == ACTIONS.stand) {
      this.actionTime = Math.random() * this.standTime;
    } else if (action.type == ACTIONS.walk) {
      // play out all the frames of animation, then animation advances to next behaviour
      this.sprite.setAnimation("talk");
      this.actionTime = 9999;
    } else if (action.type == ACTIONS.hug) {
      if (!this.getCloser(action.who)) {
        if (action.who.canSwapBehaviour()) {
          // close enough for a hug, change animation of this and the other
          this.sprite.setAnimation("hug");
          this.actionTime = 100;
          this.sprite.mirrored = this.x < action.who.x;
          // sets sprite mirrored here, doesn't reset it
          action.who.changeBehaviour(
            new Behaviour("hugged", [
              { type: "hugged", mirrored: !this.sprite.mirrored },
            ])
          );
          this.showIcon({ x: (this.x + action.who.x) / 2 });
        } else {
          this.actionTime = 25;
          this.currentBehaviour.insert(this.behaviourLoopIndex, {
            type: "stand",
          });
        }
      }
    } else if (action.type == ACTIONS.hugged) {
      this.sprite.mirrored = action.mirrored;
      this.sprite.setAnimation("hug");
      this.actionTime = 100;
    } else if (action.type == ACTIONS.bonk) {
      if (!this.getCloser(action.who)) {
        if (action.who.canSwapBehaviour()) {
          // close enough for a hug, change animation of this and the other
          this.sprite.setAnimation("bonk");
          this.actionTime = 300;
          this.sprite.mirrored = this.x < action.who.x;
          // sets sprite mirrored here, doesn't reset it
          action.who.changeBehaviour(
            new Behaviour("bonked", [
              { type: "bonked", mirrored: this.sprite.mirrored },
            ])
          );
        } else {
          this.actionTime = 25;
          this.currentBehaviour.insert(this.behaviourLoopIndex, {
            type: "stand",
          });
        }
      }
    } else if (action.type == ACTIONS.bonked) {
      this.sprite.mirrored = action.mirrored;
      this.sprite.setAnimation("bonked");
      this.actionTime = 300;
    } else if (action.type == ACTIONS.go) {
      this.actionTime = 100;
    }
  }

  canSwapBehaviour() {
    return (
      this.currentBehaviour.name != "hug" ||
      this.currentBehaviour.name != "hugged" ||
      this.currentBehaviour.name != "bonk" ||
      this.currentBehaviour.name != "bonked"
    );
  }

  getCloser(target) {
    // TODO: only done for x.
    const distance = target.x - this.x;
    // half of this sprite and half of the other sprite
    const targetSize = target.sprite ? target.sprite.displaySize : 0;
    const padding = (this.sprite.displaySize + targetSize) / 3;
    if (Math.abs(distance) > padding + 10) {
      // need to go closer to who we want to hug.
      // TODO: if too close maybe need to step away a little bit.
      this.actionTime = 100;
      this.currentBehaviour.insert(this.behaviourLoopIndex, {
        type: "go",
        x: target.x - padding * Math.sign(distance),
        y: target.y,
      });
      return true;
    } else {
      return false;
    }
  }

  showIcon(config) {
    const iconSize = 100;
    const iconSprite = {
      src: "images/bubble/action-items.png",
      cutSize: 100,
      displaySize: iconSize,
    };
    this.world.renderedBubbles.push(
      createAdvancedBubble({
        type: "icon",
        x: config.x,
        y: this.y - 20,
        spriteInfo: iconSprite,
      })
    );
  }
}

const ACTIONS = {
  walk: "walk", // direction: "left" || "right"
  stand: "stand",
  talk: "talk",
  go: "go", // x: 0, y: 0
  hug: "hug", // who: Avatar
  hugged: "hugged",
  bonk: "bonk",
  bonked: "bonked",
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
