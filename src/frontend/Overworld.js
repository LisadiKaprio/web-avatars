'use strict'

class Overworld{
    constructor(config){
        // passing in an element 
        this.element = config.element;
        // in this element, reference the canvas
        this.canvas = this.element.querySelector(".game-canvas");
        // in this canvas, reference drawing methods?? stuff? idk
        this.ctx = this.canvas.getContext("2d");

        // // const userAvatar
        // this.userAvatar = new GameObject({
        //     x: 1,
        //     y: 1,
        //     src: "images/chars/1.png"
        // })

        
        this.userAvatars = {};
        this.renderedEmotes = [];

        this.isCutscenePlaying = false;
    }

    createNewUserAvatar(user){
        // place game object
        this.userAvatars[user.name] = new GameObject({
            name: user.name,
            color: user.color,
            x: Math.random() * this.canvas.width,
            y: 950,
            src: "images/chars/1.png"
        })
        this.userAvatars[user.name].mount(this);

    }

    update(users, emoteArray){
        // difference between value and keys:
        // value = {name: 'kirinokirino', messageCount: 2}
        // key = kirinokirino
        // key is like 1 in array[1]
        for (const user of Object.keys(users)) {
            if(!this.userAvatars[user]){
                this.createNewUserAvatar(users[user]);
            }
        };
        //this.renderedEmotes = [];
        for (let i = 0; i < emoteArray.length; i++) {
            this.createNewEmote(emoteArray[i].id);
            
            this.renderedEmotes[i].mount(this);
        }
    }
    createNewEmote(emoteId){
        this.renderedEmotes.push(new GameObject({
            x: Math.random() * this.canvas.width,
            y: 950,
            src: this.getEmoteImg(emoteId)
        }))
    }

    // get (normal twitchtv) emotes
    getEmoteImg(emoteId) {
	    return "https://static-cdn.jtvnw.net/emoticons/v2/" + emoteId + "/default/dark/2.0";
    }

    // game loop
    // - updating frames, moving pos of the chars
    startGameLoop(){
        const step = () => {
            // clear canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // aligns all 
            this.ctx.textAlign = 'center';

            for(const userAvatar of Object.values(this.userAvatars)){
                userAvatar.update();
                userAvatar.sprite.draw(this.ctx);
                this.ctx.fillStyle = userAvatar.color;
                this.ctx.font = 'bold 16px VictorMono-Medium';
                this.ctx.fillText(userAvatar.name, userAvatar.x + (75/2), userAvatar.y + 75 + 3);
            }
            for(const emote of Object.values(this.renderedEmotes)){
                emote.update();
                emote.sprite.draw(this.ctx);
            }
    
    
            // draw objects
            //userAvatar.sprite.draw(this.ctx);
    
            requestAnimationFrame(() => {
                step();
            })
        }
        step();
    }

    
    

    init() {

        this.startGameLoop();
        console.log('init');

        // place game object
        // const userAvatar = new GameObject({
        //     x: 1,
        //     y: 1,
        //     src: "images/chars/1.png"
        // })

        // setTimeout(() => {
        //     userAvatar.sprite.draw(this.ctx);
        // }, 200);

    }
}