"use strict";

class Bubble {
  constructor(config) {
    this.type = config.type;
    // username the bubble (can be) attached to
    this.attachedTo = config.attachedTo;
    // define and pass in position, or else default to 0
    this.toRemove = false;
    this.x = config.x || 0;
    this.y = config.y || 950;
    this.color = config.color || "black";
    // define sprite
    this.sprite =
      config.type == "icon"
        ? new Sprite({
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
            },
          })
        : undefined;

    this.text = config.type == "text" ? config.text : undefined;

    this.ascendTime = 30;
    this.oscilateTime = 100;
    this.dissolveTime = 30;
    this.actionTime =
      config.actionTime === undefined ? this.ascendTime : config.actionTime;
    this.speed = config.speed || 2.0;

    this.behaviours = {
      idle: [{ type: "oscilate" }, { type: "dissolve" }],
    };

    this.behaviourLoop = config.behaviourLoop || this.behaviours["idle"];
    this.behaviourLoopIndex = 0;
  }

  advanceBehaviour() {
    this.behaviourLoopIndex += 1;
    if (this.behaviourLoopIndex >= this.behaviourLoop.length) {
      this.behaviourLoopIndex -= 1;
      this.actionTime = 1;
      this.toRemove = true;
      return;
    }

    let action = this.behaviourLoop[this.behaviourLoopIndex];
    if (action.type == "ascend") {
      this.actionTime = this.ascendTime;
    } else if (action.type == "oscilate") {
      this.actionTime = this.oscilateTime;
    } else if (action.type === "dissolve") {
      this.actionTime = this.dissolveTime;
    }
  }

  update() {
    this.actionTime -= 1;
    if (this.actionTime <= 0) {
      this.advanceBehaviour();
    }
    const action = this.behaviourLoop[this.behaviourLoopIndex];
    if (action.type == "ascend") {
      this.y -= this.speed;
    } else if (action.type == "oscilate") {
      const numberOfCycles = 2;
      const cycleTime = this.oscilateTime / numberOfCycles;
      const cycleOffset = 0.5;
      const cycleProgress =
        (cycleTime - 1 - ((this.actionTime - 1) % cycleTime)) / cycleTime;
      const oscillation = Math.cos(
        (cycleOffset + (cycleProgress - 0.5)) * Math.PI * 2
      );
      this.y += oscillation * this.speed;
    } else if (action.type == "dissolve") {
      //this.y -= this.speed;
      // TODO: disappear
    }
  }

  draw(ctx) {
    let xOffset = 0;
    // If its attached to something, move the text to the updated position of the entity its attached to.
    if (this.attachedTo) {
      xOffset =
        -this.x + this.attachedTo.x + this.attachedTo.sprite.displaySize / 2;
    }
    if (this.type == "text") {
      ctx.fillStyle = this.color;
      ctx.font = "bold 16px VictorMono-Medium";
      ctx.fillText(this.text, this.x + xOffset, this.y);
    } else if (this.type == "icon") {
      this.sprite.draw(ctx, xOffset);
    } else {
      console.error("Unhandled bubble type");
      console.error(this);
    }
  }
}
