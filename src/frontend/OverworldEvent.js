'use strict'
class OverworldEvent{
    constructor({overworld, event}){
        this.overworld = overworld;
        this.event = event;
    }

    // resolve tells the system that the event is done
    // gives the await eventHandler.init(); a promise so the loop there can continue
    stand(resolve){
        // receive communication on which character should walk
        const who = this.overworld.userAvatars[ this.event.who ];
        // initiate walking
        who.startBehavior({
            overworld: this.overworld
        }, {
            type: "stand",
            direction: this.event.direction,
            time: this.event.time
        })

        // Set up a handler to complete 
        // when correct person is done walking,
        // then resolve the event
        const completeHandler = e => {
            if(e.detail.whoName === this.event.who){
                document.removeEventListener("AvatarStandingComplete", completeHandler);
                resolve();
            }
        }

        document.addEventListener("AvatarStandingComplete", completeHandler)


    }

    walk(resolve){
        // receive communication on which character should walk
        const who = this.overworld.userAvatars[ this.event.who ];
        // initiate walking
        who.startBehavior({
            overworld: this.overworld
        }, {
            type: "walk",
            direction: this.event.direction,
        })

        // Set up a handler to complete 
        // when correct person is done walking,
        // then resolve the event
        const completeHandler = e => {
            if(e.detail.whoName === this.event.who){
                document.removeEventListener("AvatarWalkingComplete", completeHandler);
                resolve();
            }
        }

        document.addEventListener("AvatarWalkingComplete", completeHandler)

    }

    talking(resolve){
        // receive communication on which character 
        const who = this.overworld.userAvatars[ this.event.who ];
        // initiate walking
        who.startBehavior({
            overworld: this.overworld
        }, {
            type: "talking"
        })
        const completeHandler = e => {
            if(e.detail.whoName === this.event.who){
                document.removeEventListener("AvatarBeginTalkingComplete", completeHandler);
                resolve();
            }
        }
        document.addEventListener("AvatarBeginTalkingComplete", completeHandler);


    }


    physics(resolve){
        // receive communication on which emote should be animated
        const who = this.overworld.renderedEmotes[this.event.who];

        who.startBehavior({
            overworld: this.overworld
        }, {
            type: "physics",
            
        })

        // Set up a handler to complete 
        // when correct person is done walking,
        // then resolve the event
        const completeHandler = e => {
            if(e.detail.whoName === this.event.who){
                document.removeEventListener("EmoteAnimationComplete", completeHandler);
                resolve();
            }
        }

        document.addEventListener("EmoteAnimationComplete", completeHandler)

    }

    // kicks off event
    init() {
        // resolve comes back with the promise x_x
        return new Promise (resolve => {
            // stand or walk or ...
            // walk(resolve)
            // if(this[this.event.type] != undefined)
            this[this.event.type](resolve);
            /////console.log(this.event);
        })
    }
}