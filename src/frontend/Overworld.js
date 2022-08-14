'use strict'

class Overworld{
    constructor(config){
        // passing in an element 
        this.element = config.element;
        // in this element, reference the canvas
        this.canvas = this.element.querySelector(".game-canvas");
        // in this canvas, reference drawing methods?? stuff? idk
        this.ctx = this.canvas.getContext("2d");
    }

    init() {

        // place game object
        const userAvatar = new GameObject({
            x: 1,
            y: 1,
            src: "images/chars/1.png"
        })

        setTimeout(() => {
            userAvatar.sprite.draw(this.ctx);
        }, 200);

    }
}