const tmi = require('tmi.js');

//my options
const options = {
    options: {
        debug: true,
    },
    connection: {
        cluster: 'aws',
        reconnect: true,
    },
    channels: ['LisadiKaprio'],
};

// insert options to client
const client = new tmi.client(options);

// connect the client to the chat
client.connect();

// WHEN client is connected to chat
client.on('connected', (address, port) => {
    console.log("Connected to chat!");
})

//== == == == == my own variables == == == == == 

// is bot active?
const botActive = true;
//start bot
const startMessage = '!startWeb';
//end bot
const endMessage = '!endWeb';

//object(dictionary :) ) of users (who've written any message in chat)
const users = {};


//== == == == == == == == == == == == == == == ==

// taken straight from tmijs.com
// // channel = my channel?
// // tags = user who wrote the message
// // // [display-name] = 
// // message = the string of the message itself
// // self = ???
client.on('message', (channel, tags, message, self) => {

    // extract the username out of the tags?? T_T
    // i don't undewstand how this wowks but ok
    // so like const username = tags.username? or what?
    const { username } = tags;

    //setup to turn off bot with my/mod's chat message
    if (tags.mod || tags.badges.broadcaster){
        if(message === startMessage){
            botActive = true;
        }
        if(message === endMessage){
            botActive = false;
        }
    }

    if(botActive){
        // add entry to users-dictionary
        users[username] = {};
    }

	console.log(users);
});
		