

async function main () {

    console.log('Frontend index.js loaded.');

    // create a new Overworld instance
    let overworld = new Overworld({
        element: document.querySelector(".game-container")
    });
    // let overworld go
    overworld.init();


    let usersInFrontend = {};

    let newEmotesArray = [];

    async function pollForDataAsync () {
        // send a request to the server and store data in some variable
        try {
            const resp = await fetch('/users')
            let {users, emotes} = await resp.json()
            
            usersInFrontend = users;
            newEmotesArray = emotes;

            // redraw
            overworld.update(usersInFrontend, newEmotesArray);

        } catch (error) {
            console.error(error)
        }
        setTimeout(pollForDataAsync, 1000)
    }
    
    await pollForDataAsync()
    
}

main()