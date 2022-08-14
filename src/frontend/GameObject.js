'use strict'

class GameObject {
    constructor(config){
        // define and pass in position, or else default to 0
        this.x = config.x || 0;
        this.y = config.y || 0;
        // define sprite
        this.sprite = new Sprite({
            gameObject: this,
            src: config.src || "./images/chars/1.png",

        });
    }
}