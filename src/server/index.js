"use strict";

const tmi = require("tmi.js");
const fs = require("fs");

//= = = my own variables = = =

// CHANNEL NAME
const channelName = "LisadiKaprio";
// is bot active?
const botActive = true;
//start bot
const startMessage = "startWeb";
//end bot
const endMessage = "endWeb";
//clear users in this session
const clearUsers = "clearUsers";

// = = =

// = = = construction: users database in data/users = = =

const USER_ALLOW_LIST = [];
const DATA_DIR = "./data";
const USER_DATA_DIR = DATA_DIR + "/users";

const users = loadUsers();
let usersInThisSession = {};

let newEmotesArray = [];
let newMessagesObject = {};

function loadUsers() {
  const users = {};
  const files = fs.readdirSync(USER_DATA_DIR);
  for (const file of files) {
    const user = JSON.parse(fs.readFileSync(`${USER_DATA_DIR}/${file}`));
    if (USER_ALLOW_LIST.length === 0 || USER_ALLOW_LIST.includes(user.name)) {
      users[user.name] = user;
    }
  }
  return users;
}

function userFile(username) {
  return `${USER_DATA_DIR}/${username}.json`;
}

function deleteUser(username) {
  delete users[username];
  fs.rmSync(userFile(username));
}

function saveUser(username) {
  fs.writeFileSync(userFile(username), JSON.stringify(users[username]));
}

// = = =

// tmi client options
const options = {
  options: {
    debug: true,
  },
  connection: {
    cluster: "aws",
    reconnect: true,
  },
  channels: [channelName],
};

// insert options to client
const client = new tmi.client(options);

// connect the client to the chat
client.connect();

// WHEN client is connected to chat
client.on("connected", (address, port) => {
  console.log("Connected to chat!");
});

// hmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm
// // load the browser page with the game world on it
// (function(){
//     // create a new Overworld instance
//     const overworld = new Overworld({
//         element: document.querySelector(".game-container")
//     });
//     // make it do the do
//     overworld.init();
// })

// taken straight from tmijs.com
// // channel = my channel?
// // tags = user who wrote the message
// // // [display-name] =
// // message = the string of the message itself
// // self = ???
client.on("message", (channel, tags, message, self) => {
  // extract the username out of the tags?? T_T
  // i don't undewstand how this wowks but ok
  // so like const username = tags.username? or what?

  // kirino's explanation:
  // it extracts what's in {} out of what's on the right
  const { username } = tags;

  if (USER_ALLOW_LIST.length > 0 && !USER_ALLOW_LIST.includes(username)) {
    return;
  }

  if (botActive) {
    // detect user chatting as a participator of the game
    // first, save the user in the db if they weren't yet
    if (!(username in users)) {
      putUserIntoObject(users, tags);
    }

    // same, but for new users in current session aka current stream
    if (!(username in usersInThisSession)) {
      putUserIntoObject(usersInThisSession, tags);
    }

    if (tags.emotes) {
      for (const [emote, charPositions] of Object.entries(tags.emotes)) {
        for (let i = 0; i < charPositions.length; i++) {
          newEmotesArray.push({
            name: username,
            id: emote,
          });
        }
      }
      // for each emote in message
      // emote[1] = { who: kirinokirino, id: 65}
      // emote[2] = { who: kirinokirino, id: 65}
      // emote[3] = { who: kirinokirino, id: 46636}
    }

    const detectedCommand = message.match(/^!([a-z]+)($|\s.*)/);

    if (detectedCommand) {
      const command = detectedCommand[1];
      const args = detectedCommand[2].trim(); //.split(/\s+/)

      if (tags.mod || tags.badges?.broadcaster) {
        // MOD/BROADCASTER COMMANDS
        // !startWeb
        if (message === clearUsers) {
          usersInThisSession = {};
          //needs something in frontend that reacts to that too and deletes gameobjects
        } else if (message === startMessage) {
          botActive = true;
        } else if (message === endMessage) {
          // !endWeb
          botActive = false;
        } else if (command === "delete") {
          // !delete fab_77
          for (const tmpUsername of args) {
            if (tmpUsername in users) {
              deleteUser(tmpUsername);
            }
          }
        } else if (command === "messagecount" && args.length === 1) {
          // !messagecount fab_77
          const tmpUsername = args[0];
          if (tmpUsername in users) {
            console.log(
              `${tmpUsername} has written ${users[tmpUsername].messageCount} messages`
            );
          }
        } else {
          // Pass all the unknown commands (starting with ! ) to the frontend
          // in hopes that it knows what to do with them.
          if (usersInThisSession[username]) {
            if (!usersInThisSession[username].unhandledCommands) {
              usersInThisSession[username].unhandledCommands = [
                {
                  command: command,
                  args: args,
                },
              ];
            } else {
              usersInThisSession[username].unhandledCommands.push({
                command: command,
                args: args,
              });
            }
          }
        }
      }
    }
    if (!tags.emotes && !detectedCommand) {
      // NOT A COMMAND
      if (newMessagesObject[username]) {
        newMessagesObject[username].push(message);
      } else {
        newMessagesObject[username] = [message];
      }
    }

    // counts messages written by the user
    // part of the game?
    users[username].messageCount += 1;
    usersInThisSession[username].messageCount += 1;

    users[username].xp += 15;

    // save that as a json file then
    saveUser(username);
  }
});

function putUserIntoObject(object, tags) {
  // WHAT's IN THE USER?
  object[tags.username] = {
    name: tags.username,
    messageCount: 0,
    color: tags.color,
    xp: 0,
  };
}

// COMMUNICATION WITH THE FRONTEND

const express = require("express");
const app = express();

// what port do we run on?
const port = 2501;

// what folder will express start up?
// where is our frontend
app.use(express.static("src/frontend"));

// what's displayed in localhost:2501
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// send over the info inside the users variable
app.get("/users", (req, res) => {
  res.send({
    users: usersInThisSession,
    emotes: newEmotesArray,
    messages: newMessagesObject,
  });
  for (let user of Object.values(usersInThisSession)) {
    user.unhandledCommands = [];
  }
  newEmotesArray = [];
  newMessagesObject = {};
});

// (:
app.listen(port, () => {
  console.log(`Web-Avatars listening on http://localhost:${port}`);
});
