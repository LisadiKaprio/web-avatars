//https://www.youtube.com/watch?v=bpbghr3NnUU
'use strict'

// saves all the loaded images so they won't have to be loaded anew later
const ImgCache = {}

class Sprite {
    constructor(config){

        // if the image is already in the cache -
        // load the saved version
        if (ImgCache[config.src]) {
            this.image = ImgCache[config.src].image
            this.isGif = ImgCache[config.src].isGif
            this.isLoaded = true
        } else {
            this.image = GIF();           // creates a new gif  
            this.image.onerror = (e) => {
                // the image is maybe not a gif
                console.log("Gif loading error " + e.type);
                this.isGif = false
                // if not - we make it just an image
                this.image = new Image();
                this.image.src = config.src;
                this.image.onload = () => {
                    // we won't try to load until it's loaded
                    this.isLoaded = true;
                    ImgCache[config.src] = {
                        image: this.image,
                        isGif: this.isGif,
                    }
                }
            }

            // when the image was a gif and loaded correctly:
            this.image.onload = () => {
                this.isGif = true
                this.isLoaded = true;
                ImgCache[config.src] = {
                    image: this.image,
                    isGif: this.isGif,
                }
            }
            this.image.load(config.src);
        }

        this.isEmote = config.isEmote || false;

        // configure animation and initial state
        this.animations = config.animations || {
            "idle": [ [0,0] ]
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

        let frame = null
        // if it's a gif
        if (this.isGif) {
            // and it's done loading next frame
            if (!this.image.loading) {
                // draw that next frame
                frame = this.image.image
            // if it's a gif and the next frame isn't loaded yet
            // but the previous frame is still available
            } else if (this.image.lastFrame !== null) {
                // draw previous frame
                frame = this.image.lastFrame.image
            }
        // if it's not a gif, and it's done loading
        } else if(this.isLoaded){
            // draw that
            frame = this.image
        }
        
        // if there is something avaiable to be drawn
        if (frame) {
            ctx.drawImage(frame,
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