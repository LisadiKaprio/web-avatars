//https://www.youtube.com/watch?v=bpbghr3NnUU
'use strict'

class Sprite {
    constructor(config){

        this.image = new Image();
        this.image.src = config.src;
        this.image.onload = () => {
            // we won't try to load until it's loaded
            this.isLoaded = true;
        }

        // configure animation and initial state
        this.animations = config.animations || {
            idle: [
                [0,0]
            ]
        }
        this.currentAnimation = config.currentAnimation || "idle";
        this.currentAnimationFrame = 0;

        // reference the game object
        this.gameObject = config.gameObject;
    }
    draw(ctx){
        // position control (add nudge if needed)
        const x = this.gameObject.x;
        const y = this.gameObject.y;

        if(this.isLoaded){
            ctx.drawImage(this.image,
                // left cut, right cut,
                0,0,
                // size of the cut on x and y
                150,150,
                // position comes in here
                x, y,
                // display size
                75, 75)

        }
    }
}