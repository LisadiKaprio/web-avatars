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
            "idle": [ [0,0], [1, 0] ]
        }
        this.currentAnimation = config.currentAnimation || "idle";
        this.currentAnimationFrame = 0;
        // framerate of the animation
        this.animationFrameLimit = config.animationFrameLimit || 16;
        this.animationFrameProgress = this.animationFrameLimit;

        // reference the game object
        this.gameObject = config.gameObject;
    }

    // get current animation frame
    get frame(){
        return this.animations[this.currentAnimation][this.currentAnimationFrame];
    }

    updateAnimationProgress(){
        // Downtick frame progress
        if (this.animationFrameProgress > 0){
            this.animationFrameProgress -= 1;
            return;
        }

        // Reset the counter
        this.animationFrameProgress = this.animationFrameLimit;

        this.currentAnimationFrame += 1;

        if(this.frame == undefined){
            this.currentAnimationFrame = 0;
        }
    }

    draw(ctx){
        // position control (add nudge if needed)
        const x = this.gameObject.x;
        const y = this.gameObject.y;

        const [frameX, frameY] = this.frame;

        if(this.isLoaded){
            ctx.drawImage(this.image,
                // left cut, right cut,
                frameX * 150, frameY * 150,
                // size of the cut on x and y
                150,150,
                // position comes in here
                x, y,
                // display size
                75, 75)

        }

        this.updateAnimationProgress();
    }
}