

async function main () {

    console.log('Frontend index.js loaded.')

    
    function drawUser(){
        // create a new Overworld instance
        const overworld = new Overworld({
            element: document.querySelector(".game-container")
        });
        // let it go
        overworld.init();
    }  

    drawUser();


    
    // async function pollForDataAsync () {
    //     // send a request to the server and store data in some variable
    //     try {
    //         const resp = await fetch('/users')
    //         users = await resp.json()
    //         redraw()
    //     } catch (error) {
    //         console.error(error)
    //     }
    //     setTimeout(pollForDataAsync, 5000)
    // }
    
    // await pollForDataAsync()
}

main()