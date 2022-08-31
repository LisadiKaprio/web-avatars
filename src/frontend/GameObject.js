'use strict'

const BEHAVIOUR = {
    IDLE: "idle",
    TALK: "talk",
};

class GameObject {
    constructor(config){
        // username
        this.name = (config.name === undefined) ? "NoName" : config.name;
        // define and pass in position, or else default to 0
        this.x = config.x || 0;
        this.y = config.y || 950;
        this.color = config.color || 'black';
        // define sprite
        this.sprite = new Sprite({
            gameObject: this,
            src: config.src,
            mask: config.mask,
            color: this.color,
            animations: config.animations || {
                "idle": new Animation({
                    frames: [ [0,0], [1,0] ],
                    doesLoop: true,
                }),
                "talking": new Animation({
                    frames: [ //[0,1], 
                    [1,1], 
                    [2,1], // begin talking
                    [0,2], [1,2], [0,2], [1,2], [0,2], [1,2], [0,2], [1,2], [0,2], [1,2], [0,2], [1,2], [0,2], [1,2],  // talking
                    [2,1], [1,1], [0,1] ], // stop talking
                    doesLoop: false,
                })

                // "begin talking": [ [1,0], [1,1], [1,2] ],
                // "talking": [ [2,0], [2,1] ],
                // "stop talking": [ [1,2], [1,1], [1,0] ],

                // "begin gaining item": [ [1,0], [1,1], [1,3] ],
                // "gaining item": [ [2,2], [2,3] ],
                // "stop gaining item": [ [1,3], [1,1], [1,0] ],
                
                // "consuming item": [ [0,2], [3,0], [3,1], [3,2], [3,3], [3,2], [3,1], [3,0], [0,2],],

                // "hugging left": [ [4,0], [4,1] ],
                // "hugging right": [ [4,2], [4,3] ],


            }
        });

        
        this.stepsTilTarget = (config.stepsTilTarget === undefined) ? 24 : config.stepsTilTarget;
        this.speed = config.speed || 1;

        this.speedPhysicsX = config.speedPhysicsX || 0;
        this.speedPhysicsY = config.speedPhysicsY || 0;

        this.dragPhysicsY = config.dragPhysicsY || 0;

        this.walkingTime = config.walkingTime || 300;
        this.standTime = config.standTime || 4000;
        this.directionalUpdate = config.directionalUpdate || {
            "left": ["x", -this.speed],
            "right": ["x", this.speed]
        };
        // default direction
        this.direction = "left";

        this.behaviours = {
            [BEHAVIOUR.IDLE]: [
                { type: "walk", direction: "left"},
                // could use small time value to have them run around chaotically!
                { type: "stand", direction: "left", time: Math.random()*this.standTime},
                { type: "walk", direction: "right"},
                { type: "stand", direction: "right", time: Math.random()*this.standTime},
            ],
            [BEHAVIOUR.TALK]: [
                { type: "talking" },
            ],
        };

        // https://www.youtube.com/watch?v=e144CXGy2mc part 8
        this.behaviourLoop = config.behaviourLoop || this.behaviours[BEHAVIOUR.IDLE];
        this.behaviourLoopIndex = 0;

        // https://youtu.be/kfSTLrCoFxk?t=835
        this.retryTimeout = null;
    }

    changeBehaviour(behaviour) {
        this.emitEvent("BehaviourLoopChanged");
        this.behaviourLoop = this.behaviours[behaviour];
        this.behaviourLoopIndex = 0;
    }

    // wait for what's going on first, any overarching cutsene event or whatever
    // then do my behavior
    mount(overworld){
        setTimeout(() => {
            this.doBehaviorEvent(overworld);
        }, )
    }


    update(){
        if(this.behaviourLoop[this.behaviourLoopIndex].type === "physics"){
            this.updateEmotePosition();
        }
        if(this.behaviourLoop[this.behaviourLoopIndex].type === "walk" && this.stepsTilTarget > 0){
            this.updatePosition();
            //this.updateSprite(state);
        } 
    }

    updatePosition(){
        // define x as property and -1 or 1 as change
        let [property, change] = this.directionalUpdate[this.direction];
        if(this.x >= 1920){
            this.direction = "left";
            console.log("turning left");
        }
        if(this.x <= 0){
            this.direction = "right";
            console.log("turning right");
        }
        // actually move on x?
        this[property] += change;
        // change the value so it knows it took a step
        this.stepsTilTarget -= 1;

        if(this.stepsTilTarget <= 0){
            // We finished the walk!

            // in-browser class
            // this construction will be reused, so it can become a separate function in some separate utils.js file
            this.emitEvent("AvatarWalkingComplete");
        }
    }

    updateEmotePosition(){
        this.x += this.speedPhysicsX;
        //this.speedPhysicsX += this.accelerationPhysicsX;
        
        this.y += this.speedPhysicsY;
        this.speedPhysicsY -= this.dragPhysicsY;
        //debugger;
    }



    startBehavior(state, behavior){
        // Set character direction to whatever behavior has
        this.direction = behavior.direction;
        if(behavior.type === "walk"){
            // if we want collision, the stop for it comes here

            // Ready to walk
            // resets step
            this.stepsTilTarget = Math.random()*this.walkingTime;
        }
        if(behavior.type === "stand"){
            setTimeout(() => {
                this.emitEvent("AvatarStandingComplete");
            }, behavior.time);
        }
        if(behavior.type === "talking"){
            // play out all the frames of animation, then switch to next behavior
            this.sprite.currentAnimation = "talking";
            
        }
    }

    emitEvent(name){
        const event = new CustomEvent(name, {
            detail: {
                whoName: this.name
            }
        });
        document.dispatchEvent(event);

    }


    // do my own behavior
    async doBehaviorEvent(overworld){
        this.emitEvent("StartBehavior");
        
        // Don't execute this function if there's an overarching event happening
        // or if my behavior is empty
        if(overworld.isCutscenePlaying || this.behaviourLoop.length === 0 /* || !this.sprite.isLoaded */){
            if(this.retryTimeout) {
                clearTimeout(this.retryTimeout);
            }
            this.retryTimeout = setTimeout(() => {
                this.doBehaviorEvent(overworld);
            }, 1000)
            return;
        }

        // Setting up our event with relevant info
        // what am i supposed to do rn
        let eventConfig = this.behaviourLoop[this.behaviourLoopIndex];
        // communicate my identity
        eventConfig.who = this.name;

        // Create an event instance out of our next event config
        // communicate event to be happening
        const eventHandler = new OverworldEvent({ overworld, event: eventConfig});
        // the lines after this one will first wait until the eventhandler has finished his stuff
        await eventHandler.init();

        // Setting the next event to fire
        // allow for next event to happen
        this.behaviourLoopIndex += 1;
        // if no next event in the array, then loop from the beginning
        if(this.behaviourLoopIndex === this.behaviourLoop.length) {
            this.behaviourLoopIndex = 0;
        }

        // Do it again!
        this.doBehaviorEvent(overworld);
    }


}