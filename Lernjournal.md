# 11/08/2022

* https://www.youtube.com/watch?v=8Dd7KRpKeaE - useful video on git / github desktop
* upload package.json and package-lock.json
* node_modules should be git-ignored
* https://www.youtube.com/watch?v=P3aKRdUyr0s - useful video on npm
* https://www.youtube.com/watch?v=ijl3GUHvKIw - creating a basic twitch bot (put it inside a twitch account, make it type things in chat on start or on command; basic setup)
* tmi.js = THE twitch package everyone is using (not twitch-js!!!)

* node index.js = starts the thing up
* terminal in visual studio code doesn't detect npm for some reason??? :c

## plan for basic features
(as the project should be somewhat based on https://github.com/Zutatensuppe/farm-game, i might look up and borrow some parts from there

* save every new user into a local? database (look up in project / look up in the lecture how local database would work)
apparently it's just an array stored in a file, at least in the one example in the lecture? idk, need to look further, or make shit up as i go
* have a browser page localhost:2501
* have a new element appear on the page for every new user who types in chat
  * make elements line up reasonably on the bottom of the page
  * make twitch usernames appear above elements 
  * make emote the user typed appear about user's element, make it disappear after specific amount of secs
  * add BTTV and frankerz emotes support

* https://github.com/Err0rTV/TwitchChatOverlay/blob/839693f04e65fa04c5e651e38ddf91c873d11cae/src/OBSTwitchChat.js#L211 - I can look up how to handle emotes here, esp bttv ones

# 12/08/2022

https://www.youtube.com/watch?v=92aki9o1FlM - seems helpful!

* wanna check what 'tags' actually contains
  * how do i make it not just write me [object Object] i forgot :')
  * ok i just need to not have it be console.log(`${tags}`); 
  * the right way to write it is way easier console.log(tags);

## tags

```js
{
//////  nonsense i don't need
  'badge-info': { subscriber: '15' },
  badges: { broadcaster: '1', subscriber: '3000' },
  'client-nonce': '0f0a05d65f05931c1a486d2c8296d76c',
//////  COLOR of the username
  color: '#B22222',
//////  DISPLAY NAME
  'display-name': 'LisadiKaprio',
//////  ANY EMOTES?
//////  IF YES:  emotes: { '65': [ '5-12' ] },
//////  IF NO: emotes: null,
//////  IF MULTIPLE:  emotes: { '65': [ '15-22' ], '90129': [ '5-13' ] },
  emotes: null,
//////  first message ever in this chat?
  'first-msg': false,
//////  ??
  flags: null,
  id: 'a500aad1-cf8c-4d7a-877e-1f4873ab3586',
  mod: false,
  'returning-chatter': false,
  'room-id': '66972449',
  subscriber: true,
  'tmi-sent-ts': '1660303908289',
  turbo: false,
  'user-id': '66972449',
  'user-type': null,
//////  MORE EMOTE INFO
//////  'emotes-raw': 'emotesv2_783ce3fc0013443695c62933da3669c5:0-9',
  'emotes-raw': null,
  'badge-info-raw': 'subscriber/15',
  'badges-raw': 'broadcaster/1,subscriber/3000',
//////  THE ACTUAL USERNAME (f.e. for those who have their name written in japanese, the display name will be the jp version and the username will be what's actually written in the address bar for their twitch page)
  username: 'lisadikaprio',
//////  hm? >< what other messages can there even be? channel point reward redeems? idk
  'message-type': 'chat'
}
```

* `const users = {}; 
  ...
  users[tags.username] = true;`
???? i need to test how the hell that works
?? i guess it's just how you add items to the array/list/whatever that is? very weird to me but alright

* the video does `users.[username] = true;`, just to add the user to the users-object-list-thingy, meanwhile kirinokirino told me i might as well just write `= {}` instead, so the users object-dictionary-thing holds objects that hold multiple values themselves, a good setup for later pbbly?

* https://www.youtube.com/watch?v=fyi4vfbKEeo - how do i do geme in javascript x_x

## para's code

* define json file:
```js
// in users, in case there is such a file as users.txt already, parse the text-string from the users.txt file into a JSON object. if not ( the : symbol), then just create a new empty object {}
const users = fs.existsSync('users.txt') ? JSON.parse(fs.readFileSync('users.txt')) : {}
```

* `const` = a variable that can't be changed; `let` = a variable that can be changed; `var` = lame :/

* setting up a database out of json files in a folder
```js
// variables for folders, second one includes the variable from before
const DATA_DIR = './data'
const USER_DATA_DIR =  DATA_DIR + '/users'

// users should come from the function loadUsers(), defined later
const users = loadUsers()

// this is how we get users
function loadUsers() {
    // this variable will hold the list of user-objects
    const users = {}
    // we save the filenames of f.e. ./data/users in the files variable
    const files = fs.readdirSync(USER_DATA_DIR)
    // for each file in this directory
    for (const file of files) {
        // save a user variable, that holds a json object, parsed from the file found under f.e. ./data/users/lisadikaprio
        const user = JSON.parse(fs.readFileSync(`${USER_DATA_DIR}/${file}`))
        // in the object within the overall db users-object, save an object named after the "name" parameter inside the user-object (make sure it exists), and save the parsed json from just now in there
        users[user.name] = user
    }
    // give out the result to wherever the function was called from
    return users
}

// returns the directory of thedb file assigned to the user
function userFile(username) {
    return `${USER_DATA_DIR}/${username}.json`
}
// this is how we create a user db file
// first argument: creates a file with the above function's directory
// second argument: the data written inside this file (the entry in the db users object)
function saveUser(username) {
    fs.writeFileSync(userFile(username), JSON.stringify(users[username]))
}

// this deletes the db entry and the file of specific user
function deleteUser(username) {
    delete users[username]
    fs.rmSync(userFile(username))
}
```

* 
```js

// returns the command out of the message, cutting the message up this way:
// / = begins with
// ^ = start of string
// "if you leave ^ out, then something like iam!notacommand would match"
// ! = the needed symbol
// ([the needed symbols] + means one or more)
// $ = end of string
// | = or
// \s = spacebar
// . = any character
// * = any number of these
// / = end
// test the regex construct with https://regex101.com/
const m = message.match(/^!([a-z]+)($|\s.*)/)


// f.e. we take the message "!ban fab"
// if the message matches the format (which it does)
if (m) {
    // define command to be the first element in array 
    // 'ban'
    const command = m[1]
    // define args to be the second element in the array

    // ' fab'
    // ' fab para bert'
    
    // trim it = remove spacebars before and after

    // 'fab'
    // 'fab para bert'

    // could also split it into an array of strings. To split, search for:
    // / = beginning marker
    // \s = spacebar
    // + = one or more
    // / = ending marker
    
    // ['fab']
    // ['fab', 'para', 'bert']

    const args = m[2].trim()//.split(/\s+/)
    // if the message says !delete
    if (command === 'delete') {
      // for every username that is written after !delete
        for (const tmpUsername of args) {
          // if the written username is already in the db
            if (tmpUsername in users) {
              // delete the user (with a function we defined earlier)
                deleteUser(tmpUsername)
            }
        }
    }

    // if !messagecount was typed, and if there is 1 username written after
    if (command === 'messagecount' && args.length === 1) {
        // take this first username after the !messagecount command
        const tmpUsername = args[0]
        // if this username is in the db
        if (tmpUsername in users) {
          // notify, by calling the messageCount parameter out of this user's object
            console.log(`${tmpUsername} has written ${users[tmpUsername].messageCount} messages`)
        } 
    }

```
* regex construct can be tested with https://regex101.com/ 
* !.
  * q: "could we put a dot after the ! ?"
  * a: "you could, but i dont know for what reason, it would then allow something like !%bla to be matched, or !!bla" "the . just matches any character"

* 
```js
// add entry to users-dictionary
if (!(username in users)) {
    users[username] = {
        name: username,
        messageCount: 0,
    };
    saveUser(username)
}

if (message === '!deleteme') {
    if (username in users) {
        deleteUser(username)
    }
} else {
    users[username].messageCount += 1 
    saveUser(username)
}
```

# 13/08/2022

[x] executing on localhost:2501
```json
"start": "serve src/ -l 2501"
```

* plan: every new user that enters chat spawns a new gameobject, it displays a character sprite on random position of the game canvas, it holds the json object of the user and gets info from there: f.e. the color

# 14/08/2022


* para showed me how to divide frontend and backend. this is the code that comes into the frontend/index.js
  * I will have to implement parts of that into the Overworld.js script most likely, not have a frontend/index.js
```js

// why T_T
// i don't get why it's wrapped in an async and then executed at the end on a separate line, para says it's just how things work in browser
async function main () {

    console.log('Frontend index.js loaded.');

    // what I have already written in overworld.js - getting reference to the canvas in html
    const canvas = document.querySelector('.game-canvas');
    const ctx = canvas.getContext('2d');
    
    // defining the local users variable
    let users = {};

    // here para explained how function gets simplified syntax:

    function getThis (param1) {
         return '123123' + param1
     }
    
    const getThis = (param1) => {
         return '123123' + param1
     }
    
    const getThis = (param1) => '123123' + param1

    //
    
    // ugly code that is more easy for me to understand:
    // this function gets data out of the backend
    function pollForData () {
        // send a request to the server and store data in some variable

        // in the backend script, we have this written:
        // app.get('/users', (req, res) => {
        //    res.send(users)
        //  })
        // that way, backend creates a localhost:2501/users,
        // and now this frontend index.js fetches info from that address
        fetch('/users')
            // we save what we get in the resp variable
            // and turn it into a resp.json
            .then(function (resp) {
                return resp.json()
            })
            // we put this resp.json in the data variable
            // and assign the value of it to our local users variable
            // then call a function described later, to redraw the canvas with new info from the users variable 
            .then(function (data) {
                users = data
                redraw()
            })
            // we catch an error if something goes wrong in the above 2 steps
            .catch(function (error) {
                console.error(error)
            })
            // in the end, we execute this pollForData function again,
            // but we also wait 5 seconds everytime to do so
            .finally(function () {
                setTimeout(function () {
                    pollForData()
                }, 5000)
            })
    }
    
    
    // start polling for data
    pollForData()

  
    // this is the proper way to write that same function
    // it needs to be async because ???????????  
    async function pollForDataAsync () {
        // send a request to the server and store data in some variable

        // we try to fetch this localhost:2501/users,
        // and put it into the resp variable
        // then we try to put the .json from it into our local users variable
        // then we call this redraw function described later
        // if any on this won't work, we catch an error
        // then we wait for 5 seconds and then execute this same function again
        try {
            const resp = await fetch('/users')
            users = await resp.json()
            redraw()
        } catch (error) {
            console.error(error)
        }
        setTimeout(pollForDataAsync, 5000)
    }
    
    
    await pollForDataAsync()


    // this function redraws the canvas
    function redraw () {
        // define the position of the text that will be written
        let y = 50
        let x = 50
        // ?? idk it erases the whole canvas probably
        ctx.clearRect(0, 0, canvas.clientWidth, canvas.height)
        // for every key in the users object
        // (para told me i might need to make users an array instead of an object later)
        for (const key of Object.keys(users)) {
            // here, user is one key from the users object
            const user = users[key]
            // writes text that displays some info from that user object
            ctx.fillText(`${user.name} (${user.messageCount})`, x, y)
            // moves the y by some pixels down so the text for the next user is written a bit more to the bottom
            y += 20
        }
    }
    
}
// executes the whole script here
main()
```

* what's in the backend server/index.js:

```js

// COMMUNICATION WITH THE FRONTEND

const express = require('express');
const app = express();

// what port do we run on?
const port = 2501;

// what folder will express start up?
// where is our frontend
app.use(express.static('src/frontend'));

// what's displayed in localhost:2501
app.get('/', (req, res) => {
  res.send('Hello World!')
})

// send over the info inside the users variable
app.get('/users', (req, res) => {
  res.send(users)
})

// (: 
app.listen(port, () => {
  console.log(`Web-Avatars listening on port ${port}`)
})
```

* difference between value and keys:
  * value = {name: 'kirinokirino', messageCount: 2}
  * key = kirinokirino
  * key is like 1 in array[1]

[x] make avatars have walking-standing behavior and execute it by default

[x] make it random

[x] idle animation

[x] only show users from current section

* next TODO:

[ ] usernames floating above avatars

[ ] usernames having the same color as in twitch chat

[ ] used emotes appearing above avatars

[ ] emotes having float up and disappear animation

# 17/08/2022

* ` style="color: rgb(0, 128, 0);" ` to set color of a (text) element

* kirino kirino, [17/08/2022 18:10]
ctx.fillStyle = 'blue';

* kirino kirino, [17/08/2022 18:10]
ctx.font = 'bold 48px serif';