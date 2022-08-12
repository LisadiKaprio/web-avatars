11/08/2022
https://www.youtube.com/watch?v=8Dd7KRpKeaE - useful video on git / github desktop
- upload package.json and package-lock.json
- node_modules should be git-ignored
https://www.youtube.com/watch?v=P3aKRdUyr0s - useful video on npm
https://www.youtube.com/watch?v=ijl3GUHvKIw - creating a basic twitch bot (put it inside a twitch account, make it type things in chat on start or on command; basic setup)
- tmi.js = THE twitch package everyone is using (not twitch-js!!!)

- node index.js = starts the thing up
- terminal in visual studio code doesn't detect npm for some reason??? :c

==plan for basic features:==
(as the project should be somewhat based on https://github.com/Zutatensuppe/farm-game, i might look up and borrow some parts from there)
- save every new user into a local? database (look up in project / look up in the lecture how local database would work)
- - apparently it's just an array stored in a file, at least in the one example in the lecture? idk, need to look further, or make shit up as i go
- have a browser page localhost:2501
- have a new element appear on the page for every new user who types in chat
- - make elements line up reasonably on the bottom of the page
- - make twitch usernames appear above elements 
- - make emote the user typed appear about user's element, make it disappear after specific amount of secs
- - add BTTV and frankerz emotes support

https://github.com/Err0rTV/TwitchChatOverlay/blob/839693f04e65fa04c5e651e38ddf91c873d11cae/src/OBSTwitchChat.js#L211 - I can look up how to handle emotes here, esp bttv ones

12/08/2022
https://www.youtube.com/watch?v=92aki9o1FlM - seems helpful!

- wanna check what 'tags' actually contains
- - how do i make it not just write me [object Object] i forgot :')
- - ok i just need to not have it be console.log(`${tags}`); 
- - the right way to write it is way easier console.log(tags);

=======tags beinhaltet:========

{
- - nonsense i don't need
  'badge-info': { subscriber: '15' },
  badges: { broadcaster: '1', subscriber: '3000' },
  'client-nonce': '0f0a05d65f05931c1a486d2c8296d76c',
- - COLOR of the username
  color: '#B22222',
- - DISPLAY NAME
  'display-name': 'LisadiKaprio',
- - ANY EMOTES?
- - IF YES:  emotes: { '65': [ '5-12' ] },
- - IF NO: emotes: null,
- - IF MULTIPLE:  emotes: { '65': [ '15-22' ], '90129': [ '5-13' ] },
  emotes: null,
- - first message ever in this chat?
  'first-msg': false,
- -???
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
- - MORE EMOTE INFO
- - 'emotes-raw': 'emotesv2_783ce3fc0013443695c62933da3669c5:0-9',
  'emotes-raw': null,
  'badge-info-raw': 'subscriber/15',
  'badges-raw': 'broadcaster/1,subscriber/3000',
- - THE ACTUAL USERNAME (f.e. for those who have their name written in japanese, the display name will be the jp version and the username will be what's actually written in the address bar for their twitch page)
  username: 'lisadikaprio',
- - hm? >< what other messages can there even be? channel point reward redeems? idk
  'message-type': 'chat'
}

- const users = {}; 
  ...
  users[tags.username] = true;
???? i need to test how the hell that works
?? i guess it's just how you add items to the array/list/whatever that is? very weird to me but alright

- the video does users.[username] = true;, just to add the user to the users-object-list-thingy, meanwhile kirinokirino told me i might as well just write = {} instead, so the users object-dictionary-thing holds objects that hold multiple values themselves, a good setup for later pbbly?