"use strict";

const MESSAGES_ALL_OVER_THE_PLACE = false;
const CHAT = {
  x: 20,
  y: 20,
  fontSize: 18,
  lineHeight: 24,
  maxLines: 3,
  outlineWidth: 0.4,
  outlineColor: "black",
};
const INACTIVE_TIME = 1000 * 60 * 20;

class World {
  constructor(config) {
    // passing in an element
    this.element = config.element;
    // in this element, reference the canvas
    this.canvas = this.element.querySelector(".game-canvas");
    this.ctx = this.canvas.getContext("2d");

    this.userAvatars = {};
    this.renderedEmotes = [];
    this.renderedBubbles = [];

    this.chat = [{ text: "Have a good day!", color: "red" }];

    this.time = 0;
  }

  feedNewData(users, emotes, messages) {
    this.time += UPDATE_PERIOD;

    // difference between value and keys:
    // value = {name: 'kirinokirino', messageCount: 2, ... }
    // key = kirinokirino
    // key is like 1 in array[1]

    for (const [name, user] of Object.entries(users)) {
      // create a new user avatar.
      if (!this.userAvatars[name]) {
        this.userAvatars[name] = createNewUserAvatar(
          user,
          Math.random() * this.canvas.width,
          this.time
        );
        this.chat.push({
          text: `Hello ${name}, thanks for chatting!`,
          color: user.color,
        });
      }

      // handle user commands
      this.handleCommands(user);

      // handle user messages
      if (messages[name] || emotes.some((emote) => emote.name == name)) {
        let avatar = this.userAvatars[name];
        avatar.pushMotivation(BEHAVIOURS.talk);
        if (!avatar.isActive) {
          this.chat.push({
            text: `Welcome back ${name}!`,
            color: users[user].color,
          });
        }
        avatar.isActive = true;
        avatar.lastChatTime = this.time;
        let xpSprite = {
          src: "images/bubble/xp.png",
          cutSize: 150,
          displaySize: 100,
        };
        this.renderedBubbles.push(
          createAdvancedBubble({
            type: "icon",
            x: avatar.x,
            y: avatar.y,
            spriteInfo: xpSprite,
          })
        );

        // log the message in chat and add a message bubble
        if (MESSAGES_ALL_OVER_THE_PLACE) {
          for (const message of messages[user]) {
            this.chat.push({ text: message, color: users[user].color });
            this.renderedBubbles.push(
              createAdvancedBubble(
                {
                  type: "text",
                  text: message,
                  x: Math.random() * this.canvas.width,
                  y: Math.random() * this.canvas.height,
                  behaviourLoop: [
                    { type: "ascend", time: 100 },
                    { type: "dissolve", time: 30 },
                  ],
                },
                message
              )
            );
          }
        }
      }
    }

    // spawn new emotes since last data pull
    this.renderedEmotes.push(...createNewEmotes(emotes, this.userAvatars));
  }

  handleCommands(user) {
    const commands = user.unhandledCommands;
    if (commands) {
      for (const { command, args } of commands) {
        if (command == "hug") {
          const toHug = args
            ? args
            : [
                Object.keys(this.userAvatars)
                  .filter((name) => name != user.name)
                  .random(),
              ];

          this.chat.push({ text: `${command} ${toHug}` });
          const userAvatar = this.userAvatars[user.name];
          let behaviours = [];
          for (const name of toHug) {
            const whoToHug = this.userAvatars[name];
            if (whoToHug) {
              behaviours.push(
                new Behaviour("hug", [{ type: ACTIONS.hug, who: whoToHug }])
              );
            }
          }
          if (behaviours.length > 0) {
            for (const behaviour of behaviours) {
              userAvatar.pushMotivation(behaviour);
            }
          }
        }
        if (command == "whoami") {
          this.chat.push({
            text: `you are ${user.name}`,
            color: "blue",
          });
        } else if (command == "stats") {
          this.chat.push({
            text: `${user.name} stats: ${user.xp} xp.`,
            color: "blue",
          });
        } else if (command == "dbg") {
          console.log(user);
          const userAvatar = this.userAvatars[user.name];
          this.chat.push({
            text: `${userAvatar.currentBehaviour.dbg()} | ${JSON.stringify(
              userAvatar.motivation
            )}`,
          });
        } else {
          // Ignore unhandled commands.
        }
      }
    }
  }

  update(timestep) {
    // clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.updateAvatars();
    this.updateEmotes();
    this.updateBubbles();
    this.updateChat();
  }

  updateAvatars() {
    // aligns all nicknames
    this.ctx.textAlign = "center";
    this.ctx.font = "bold 16px VictorMono-Medium";
    for (const userAvatar of Object.values(this.userAvatars)) {
      if (
        userAvatar.isActive &&
        this.time - userAvatar.lastChatTime >= INACTIVE_TIME
      ) {
        userAvatar.changeBehaviour(BEHAVIOURS.sleep);
        userAvatar.isActive = false;
        this.chat.push({
          text: `${userAvatar.name} hasn't written much in chat for a while now... Seems like they fell asleep!`,
          color: "grey",
        });
      }
      userAvatar.update();
      userAvatar.draw(this.ctx);
    }
  }

  updateEmotes() {
    this.renderedEmotes = this.renderedEmotes.filter(
      (emote) => !emote.toRemove
    );
    for (const emote of Object.values(this.renderedEmotes)) {
      emote.update();
      emote.sprite.draw(this.ctx);
    }
  }

  updateBubbles() {
    this.renderedBubbles = this.renderedBubbles.filter(
      (bubble) => !bubble.toRemove
    );

    this.ctx.font = "bold 16px VictorMono-Medium";
    for (let bubble of this.renderedBubbles) {
      bubble.update();
      bubble.draw(this.ctx);
    }
  }

  updateChat() {
    // remove the lines that wouldn't fit in the chat
    while (this.chat.length > CHAT.maxLines) {
      this.chat.shift();
    }
    // styles applicable to all lines
    this.ctx.textAlign = "start";
    this.ctx.font = "bold " + CHAT.fontSize + "px VictorMono-Medium";
    this.ctx.lineWidth = CHAT.outlineWidth;
    this.ctx.strokeStyle = CHAT.outlineColor;

    for (let i = 0; i < this.chat.length; i++) {
      const logLine = this.chat[i];
      this.ctx.fillStyle = logLine.color ? logLine.color : "grey";
      this.ctx.fillText(logLine.text, CHAT.x, CHAT.y + i * CHAT.lineHeight);
      this.ctx.strokeText(logLine.text, CHAT.x, CHAT.y + i * CHAT.lineHeight);
    }
  }
}

function createNewUserAvatar(user, x, time) {
  let avatar = new Avatar({
    name: user.name,
    color: user.color,
    x: x,
    y: 850,
    src: "images/chars/bunny.png",
    mask: "images/chars/bunny-mask.png",
    time: time,
    displaySize: 100,
  });
  return avatar;
}

function createTextBubble(origin, contents) {
  let xOffset = origin.sprite ? origin.sprite.displaySize / 2 : 0;
  const bubble = new Bubble({
    type: "text",
    //attachedTo: origin,
    x: origin.x + xOffset,
    y: origin.y - 0,
    text: contents,
  });
  return bubble;
}

function createAdvancedBubble(config) {
  let offset = config.spriteInfo ? config.spriteInfo.displaySize / 2 : 0;
  const bubble = new Bubble({
    type: config.type,
    //attachedTo: origin,
    x: config.x,
    y: config.y - offset,
    text: config.text,
    displaySize: config.spriteInfo.displaySize,
    cutSize: config.spriteInfo.cutSize,
    src: config.spriteInfo.src,
    behaviourLoop: config.behaviourLoop,
  });
  return bubble;
}

function createNewEmote(emoteId, x, y) {
  let emote = new Emote({
    x: x,
    y: y,
    src: getEmoteImg(emoteId),
    speedPhysicsX: Math.random() * 6 - 3,
    speedPhysicsY: -(Math.random() * 5),
    dragPhysicsY: -0.02,
  });
  return emote;
}

function createNewEmotes(emotes, avatars) {
  let newEmotes = [];
  for (let i = 0; i < emotes.length; i++) {
    let avatar = avatars[emotes[i].name];
    const x = avatar.x + avatar.sprite.displaySize / 2;
    const y = avatar.y - 25;
    newEmotes.push(createNewEmote(emotes[i].id, x, y));
  }
  return newEmotes;
}

// get (normal twitchtv) emotes
function getEmoteImg(emoteId) {
  return (
    "https://static-cdn.jtvnw.net/emoticons/v2/" + emoteId + "/default/dark/2.0"
  );
}
