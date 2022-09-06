"use strict";

const MESSAGES_ALL_OVER_THE_PLACE = true;
const CHAT = { x: 20, y: 20, font_size: 18, line_height: 24 };

class Overworld {
  constructor(config) {
    // passing in an element
    this.element = config.element;
    // in this element, reference the canvas
    this.canvas = this.element.querySelector(".game-canvas");
    // in this canvas, reference drawing methods?? stuff? idk
    this.ctx = this.canvas.getContext("2d");

    this.userAvatars = {};
    this.renderedEmotes = [];
    this.renderedBubbles = [];

    this.logs = [{ text: "Have a good day!", color: "red" }];

    this.time = 0;
  }

  update(users, emoteArray, messagesObject) {
    this.time += UPDATE_PERIOD;
    // difference between value and keys:
    // value = {name: 'kirinokirino', messageCount: 2}
    // key = kirinokirino
    // key is like 1 in array[1]
    for (const user of Object.keys(users)) {
      if (!this.userAvatars[user]) {
        this.userAvatars[user] = createNewUserAvatar(
          users[user],
          Math.random() * this.canvas.width,
          this.time
        );
        this.logs.push({
          text: `Hello ${user}, thanks for chatting!`,
          color: users[user].color,
        });
      }

      // check if user tried to perform an action
      const commands = users[user].unhandledCommands;
      for (const { command, args } of commands) {
        if (command == "whoami") {
          this.logs.push({
            text: `you are ${user}`,
            color: "blue",
          });
        } else {
          this.logs.push({
            text: `ERROR - ${user}: unknown command ${command}!`,
            color: "red",
          });
        }
      }

      // check if user wrote a message
      if (messagesObject[user]) {
        let avatar = this.userAvatars[user];
        avatar.changeBehaviour("talk");
        avatar.lastChatTime = this.time;
        this.renderedBubbles.push(createTextBubble(avatar, "+15 xp"));

        // render the messages themselves on the random position of the entire screen.
        if (MESSAGES_ALL_OVER_THE_PLACE) {
          for (const message of messagesObject[user]) {
            this.logs.push({ text: message, color: users[user].color });
            this.renderedBubbles.push(
              createAdvancedBubble(
                {
                  type: "text",
                  text: message,
                  x: Math.random() * this.canvas.width,
                  y: Math.random() * this.canvas.height,
                  behaviourLoop: [
                    { type: "ascend" },
                    { type: "ascend" },
                    { type: "ascend" },
                    { type: "ascend" },
                    { type: "dissolve" },
                  ],
                },
                message
              )
            );
          }
        }
      }
    }
    for (let i = 0; i < emoteArray.length; i++) {
      this.renderedEmotes.push(
        createNewEmote(emoteArray[i].id, this.userAvatars[emoteArray[i].name])
      );
    }
  }

  // game loop
  // - updating frames, moving pos of the chars
  startGameLoop() {
    const step = () => {
      // clear canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // aligns all
      this.ctx.textAlign = "center";

      for (const userAvatar of Object.values(this.userAvatars)) {
        userAvatar.update();
        userAvatar.sprite.draw(this.ctx);
        this.ctx.fillStyle = userAvatar.color;
        this.ctx.font = "bold 16px VictorMono-Medium";
        this.ctx.fillText(
          userAvatar.name,
          userAvatar.x + userAvatar.sprite.displaySize / 2,
          userAvatar.y + userAvatar.sprite.displaySize + 3
        );
        if (
          userAvatar.isActive &&
          this.time - userAvatar.lastChatTime >= 1000 * 60 * 20
        ) {
          userAvatar.changeBehaviour("sleep");
          userAvatar.isActive = false;
          this.logs.push({
            text: `${userAvatar.name} hasn't written much in chat for a while now... Seems like they fell asleep!`,
            color: "grey",
          });
        }
      }

      this.renderedEmotes = this.renderedEmotes.filter(
        (emote) => !emote.toRemove
      );
      for (const emote of Object.values(this.renderedEmotes)) {
        emote.update();
        emote.sprite.draw(this.ctx);
      }
      this.renderedBubbles = this.renderedBubbles.filter(
        (bubble) => !bubble.toRemove
      );
      for (let bubble of this.renderedBubbles) {
        bubble.update();
        bubble.draw(this.ctx);
      }

      while (this.logs.length > 3) {
        this.logs.shift();
      }
      for (let i = 0; i < this.logs.length; i++) {
        const log_line = this.logs[i];
        this.ctx.textAlign = "start";
        this.ctx.fillStyle = log_line.color;
        this.ctx.font = "bold " + CHAT.font_size + "px VictorMono-Medium";
        this.ctx.fillText(log_line.text, CHAT.x, CHAT.y + i * CHAT.line_height);
      }

      requestAnimationFrame(() => {
        step();
      });
    };
    step();
  }

  init() {
    this.startGameLoop();
    console.log("init");
  }
}

function createNewUserAvatar(user, x, time) {
  let avatar = new Avatar({
    name: user.name,
    color: user.color,
    x: x || 500,
    y: 850,
    src: "images/chars/bunny.png",
    mask: "images/chars/bunny-mask.png",
    time: time,
  });
  return avatar;
}

function createTextBubble(origin, contents) {
  let xOffset = origin.sprite ? origin.sprite.displaySize / 2 : 0;
  const bubble = new Bubble({
    type: "text",
    //attachedTo: origin,
    x: origin.x + xOffset,
    y: origin.y - 100,
    text: contents,
  });
  return bubble;
}

function createAdvancedBubble(config) {
  let xOffset = config.sprite ? config.sprite.displaySize / 2 : 0;
  const bubble = new Bubble({
    type: config.type,
    //attachedTo: origin,
    x: config.x + xOffset,
    y: config.y - 100,
    text: config.text,
    behaviourLoop: config.behaviourLoop || "idle",
  });
  return bubble;
}

function createNewEmote(emoteId, userAvatar) {
  let emote = new Emote({
    x: userAvatar.x + userAvatar.sprite.displaySize / 2,
    y: userAvatar.y - 25,
    src: getEmoteImg(emoteId),
    speedPhysicsX: Math.random() * 6 - 3,
    speedPhysicsY: -(Math.random() * 5),
    dragPhysicsY: -0.02,
  });
  return emote;
}

// get (normal twitchtv) emotes
function getEmoteImg(emoteId) {
  return (
    "https://static-cdn.jtvnw.net/emoticons/v2/" + emoteId + "/default/dark/2.0"
  );
}
