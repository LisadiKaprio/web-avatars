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

    // MY WONKY CODE HMM
    // walkUserAvatar(user){
    //     // let targetX = 0;
    //     // let stepsTilTarget = 0;
    //     if(user.stepsTilTarget == 0){
    //         user.x = Math.random() * this.canvas.width;
    //     }
    //     this.stepUserAvatar(user, )

    // }

    // stepUserAvatar(user, property, change){

    // }

    update(users){
        // difference between value and keys:
        // value = {name: 'kirinokirino', messageCount: 2}
        // key = kirinokirino
        // key is like 1 in array[1]
        for (const user of Object.keys(users)) {
            if(!this.userAvatars[user]){
                this.createNewUserAvatar(users[user]);
                
                //console.log(users[user]);
                //console.log(user);
            }
        };
        
        // console.log(users);
        // console.log(this.userAvatars);
        // debugger;


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