'use strict'

class GameObject {
    constructor(config){
        // username
        this.name = config.name || "NoName";
        // define and pass in position, or else default to 0
        this.x = config.x || 0;
        this.y = config.y || 0;
        // define sprite
        this.sprite = new Sprite({
            gameObject: this,
            src: config.src || "./images/chars/1.png",

        });

        
        this.stepsTilTarget = 24;
        this.directionalUpdate = {
            "left": ["x", -8],
            "right": ["x", 8]
        };
        this.direction = "left";


        // https://www.youtube.com/watch?v=e144CXGy2mc part 8
        this.behaviourLoop = config.behaviourLoop || [
            { type: "walk", direction: "left"},
            { type: "stand", direction: "left", time: 800},
            { type: "walk", direction: "right"},
            { type: "stand", direction: "right", time: 800},
        ]
        this.behaviourLoopIndex = 0;
    }

    // wait for what's going on first, any overarching cutsene event or whatever
    // then do my behavior
    mount(overworld){
        setTimeout(() => {
            this.doBehaviorEvent(overworld);
        }, 10)
    }


    update(){
        if(this.stepsTilTarget > 0){
            this.updatePosition();
            //this.updateSprite(state);
        } else{

            //TODO: case to move character or something???

        }
    }

    updatePosition(){
        // define x as property and -1 or 1 as change
        const [property, change] = this.directionalUpdate[this.direction];
        // actually move on x?
        this[property] += change;
        // change the value so it knows it took a step
        this.stepsTilTarget -= 1;

        if(this.stepsTilTarget === 0){
            // We finished the walk!

            // in-browser class
            // this construction will be reused, so it can become a separate function in some separate utils.js file
            const event = new CustomEvent("AvatarWalkingComplete", {
                detail: {
                    whoName: this.name
                }
            });
            document.dispatchEvent(event);
        }
    }

    startBehavior(state, behavior){
        // Set character direction to whatever behavior has
        this.direction = behavior.direction;
        if(behavior.type === "walk"){
            // if we want collision, the stop for it comes here

            // Ready to walk
            // resets step
            this.stepsTilTarget = 16;
        }
        if(behavior.type === "stand"){
            setTimeout(() => {
                const event = new CustomEvent("AvatarStandingComplete", {
                    detail: {
                        whoName: this.name
                    }
                });
                document.dispatchEvent(event);
            }, behavior.time);
        }

    }


    // do my own behavior
    async doBehaviorEvent(overworld){
        
        // Don't execute this function if there's an overarching event happening
        // or if my behavior is empty
        if(overworld.isCutscenePlaying || this.behaviourLoop.length === 0){
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