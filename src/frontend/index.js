"use strict";

const UPDATE_PERIOD = 1000;

async function main() {
  console.log("Frontend index.js loaded.");

  // create a new Overworld instance
  let overworld = new Overworld({
    element: document.querySelector(".game-container"),
  });
  // let overworld go
  overworld.init();

  let usersInFrontend = {};

  let newEmotesArray = [];
  let newMessagesObject = {};

  async function pollForDataAsync() {
    // send a request to the server and store data in some variable
    try {
      const resp = await fetch("/users");
      let { users, emotes, messages } = await resp.json();

      usersInFrontend = users;
      newEmotesArray = emotes;
      newMessagesObject = messages;

      // redraw
      overworld.update(usersInFrontend, newEmotesArray, newMessagesObject);
    } catch (error) {
      console.error(error);
    }
    setTimeout(pollForDataAsync, UPDATE_PERIOD);
  }

  await pollForDataAsync();
}

main();
