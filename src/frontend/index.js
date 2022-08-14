

async function main () {

    console.log('Frontend index.js loaded.');

    // create a new Overworld instance
    let overworld = new Overworld({
        element: document.querySelector(".game-container")
    });
    
    function drawWorld(){
        // let overworld go
        overworld.init();
    }  

    drawWorld();

    let usersInFrontend = {};
    

    async function pollForDataAsync () {
        // send a request to the server and store data in some variable
        try {
            const resp = await fetch('/users')
            usersInFrontend = await resp.json()

            // redraw
            overworld.update(usersInFrontend);
            
        } catch (error) {
            console.error(error)
        }
        setTimeout(pollForDataAsync, 5000)
    }
    
    await pollForDataAsync()
    
}

main()