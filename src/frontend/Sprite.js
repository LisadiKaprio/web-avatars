//https://www.youtube.com/watch?v=bpbghr3NnUU
'use strict'

// saves all the loaded images so they won't have to be loaded anew later
const ImgCache = {}

class Animation {
    constructor(config){
        this.frames = config.frames || [];
        this.doesLoop = config.doesLoop;
    }
}

class Sprite {
    constructor(config){
        // this happens when the ImageUtil finishes loading:
        const loaded = (drawable) => {
            this.drawable = drawable
        }

        const util = new ImageUtil()
        if (config.mask && config.color) {
            util.asMaskedDrawable(config.src, config.mask, config.color).then(loaded)
        } else {
            util.asDrawable(config.src).then(loaded)
        }

        this.isEmote = config.isEmote || false;
        this.cutSize = config.cutSize || 300;
        this.displaySize = config.displaySize || 150;

        // configure animation and initial state
        this.animations = config.animations || {
            //"idle": [ [0,0], [1,0] ]
            "idleDefault": new Animation({
                frames: [ [0,0], [1,0] ],
                doesLoop: true,
            })

        }
        this.currentAnimation = config.currentAnimation || "idle";
        this.currentAnimationFrame = 0;
        // framerate of the animation
        this.animationFrameLimit = config.animationFrameLimit || 25;
        this.animationFrameProgress = this.animationFrameLimit;

        // reference the game object
        this.gameObject = config.gameObject;
    }

    // get current animation frame
    get frame(){
        // return this.animations[this.currentAnimation][this.currentAnimationFrame];
        return this.animations[this.currentAnimation].frames[this.currentAnimationFrame];
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
            if(this.animations[this.currentAnimation].doesLoop){
                this.currentAnimationFrame = 0;
            }
            else{
                console.log(this.gameObject);
                this.gameObject.emitEvent("AvatarBeginTalkingComplete");
                this.gameObject.behaviourLoop = this.gameObject.idleBehaviour;
                this.gameObject.behaviourLoopIndex = 0;
                this.currentAnimation = "idle";
                this.currentAnimationFrame = 0;
            }
        }
    }

    draw(ctx){
        // position control (add nudge if needed)
        const x = this.gameObject.x;
        const y = this.gameObject.y;

        const [frameX, frameY] = this.frame;

        // if(this.drawable){
        //    image = this.drawable.image();
        // } else{
        //     image = null
        // }
        const image = this.drawable ? this.drawable.image() : null
        // if there is something avaiable to be drawn
        if (image) {
            ctx.drawImage(image,
                // left cut, right cut,
                // had a bug where frameX and frameY were switched around unexpectedly
                // might need to go back and fix again if bug reoccurs
                // (no)
                frameX * this.cutSize, frameY * this.cutSize,
                // size of the cut on x and y
                this.cutSize, this.cutSize,
                // position comes in here
                x, y,
                // display size
                this.displaySize, this.displaySize);
        }
        
        this.updateAnimationProgress();
    }
}