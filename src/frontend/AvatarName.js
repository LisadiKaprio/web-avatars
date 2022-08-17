class AvatarName{
    constructor(config){
        this.name = config.name;
        this.color = config.color;
        this.x = config.x;
        this.y = config.y + 75 + 5;
        this.hudElement = null;
    }

    // createElement(){
    //     this.hudElement = document.createElement("div");
    //     this.hudElement.classList.add("AvatarName");
    //     // maybe i would need this kind of line for something?
    //     // it allows to style stuff accordingly separately
    //     // this.hudElement.setAttribute("data-team", this.team);
    //     this.hudElement.innerHTML = (`
    //         <p class = "AvatarName_p" style="color: ${this.color}; margin: 0 auto; position: absolute; top: ${this.x}; left: ${this.y} ">${this.name}</p>
    //     `)
    // }
    // updateYPosition(y){
    //     this.hudElement.innerHTML = (`
    //         <p class = "AvatarName_p" style="color: ${this.color}; margin: 0 auto; position: absolute; top: ${this.x}; left: ${y} ">${this.name}</p>
    //     `)
    // }
    init(container){
        // this.createElement();
        // container.appendChild(this.hudElement)
    }
    
}