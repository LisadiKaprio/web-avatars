"use strict";

const UPDATE_PERIOD = 1000;

async function main() {
  // create a new World instance
  let world = new World({
    element: document.querySelector(".game-container"),
  });

  world.init();

  async function fetchUsers() {
    // fetch the users, emotes and messages from the server.
    try {
      const resp = await fetch("/users");
      let { users, emotes, messages } = await resp.json();

      // update the world with the data from the server.
      world.update(users, emotes, messages);
    } catch (error) {
      if (error.message.startsWith("NetworkError")) {
        // TODO: a disconnect icon or loading message.
        console.error("Server didn't respond!");
      } else {
        throw error;
      }
    }

    // queue the next server request
    setTimeout(fetchUsers, UPDATE_PERIOD);
  }

  await fetchUsers();
}

main();
