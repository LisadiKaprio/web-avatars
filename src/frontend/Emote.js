export { Emote };

import { Sprite } from "./Sprite.js";

class Emote {
  constructor(config) {
    this.x = config.x || 0;
    this.y = config.y || 950;
    this.toRemove = false;

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

    if (this.y >= 5000) {
      this.toRemove = true;
    }
  }
}
