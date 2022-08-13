'use strict'
const tmi = require('tmi.js');
const fs = require('fs');

//= = = my own variables = = =

// CHANNEL NAME
const channelName = 'LisadiKaprio';
// is bot active?
const botActive = true;
//start bot
const startMessage = 'startWeb';
//end bot
const endMessage = 'endWeb';

// = = =

// = = = construction: users database in data/users = = =

const DATA_DIR = './data';
const USER_DATA_DIR =  DATA_DIR + '/users';

const users = loadUsers();

function loadUsers() {
    const users = {};
    const files = fs.readdirSync(USER_DATA_DIR);
    for (const file of files) {
        const user = JSON.parse(fs.readFileSync(`${USER_DATA_DIR}/${file}`));
        users[user.name] = user;
    };
    return users;
};

function userFile(username) {
    return `${USER_DATA_DIR}/${username}.json`;
};

function deleteUser(username) {
    delete users[username];
    fs.rmSync(userFile(username));
};

function saveUser(username) {
    fs.writeFileSync(userFile(username), JSON.stringify(users[username]));
};

// = = =


// tmi client options
const options = {
    options: {
        debug: true,
    },
    connection: {
        cluster: 'aws',
        reconnect: true,
    },
    channels: [channelName],
};

// insert options to client
const client = new tmi.client(options);

// connect the client to the chat
client.connect();

// WHEN client is connected to chat
client.on('connected', (address, port) => {
    console.log("Connected to chat!");
})

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

    // kirino's explanation:
    // it extracts what's in {} out of what's on the right
    const { username } = tags;
    
    const detectedCommand = message.match(/^!([a-z]+)($|\s.*)/)

    if (detectedCommand) {
        const command = detectedCommand[1];
        const args = detectedCommand[2].trim();//.split(/\s+/)

        if (tags.mod || tags.badges.broadcaster){
            // MOD/BROADCASTER COMMANDS
            // !startWeb
            if(message === startMessage){
                botActive = true;
            }
            // !endWeb
            if(message === endMessage){
                botActive = false;
            }
            // !delete fab_77
            if (command === 'delete') {
                for (const tmpUsername of args) {
                    if (tmpUsername in users) {
                        deleteUser(tmpUsername)
                    }
                }
            }
            // !messagecount fab_77
            if (command === 'messagecount' && args.length === 1) {
                const tmpUsername = args[0]
                if (tmpUsername in users) {
                    console.log(`${tmpUsername} has written ${users[tmpUsername].messageCount} messages`)
                } 
            }
        }
    }

    if(botActive){

        // detect user chatting as a participator of the game
        // first, save the user in the db if they weren't yet
        if (!(username in users)) {
            // WHAT's IN THE USER?
            users[username] = {
                name: username,
                messageCount: 0,
                };
            // save that as a json file then
            // saveUser(username);
        } 
        
        // counts messages written by the user
        // part of the game?
        users[username].messageCount += 1;

        // save that as a json file then
        saveUser(username);
    }

	console.log(users);
});
		