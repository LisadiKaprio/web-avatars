#!/usr/bin/env -S deno run --allow-net=irc-ws.chat.twitch.tv --allow-read="./data","../frontend" --allow-write="./data" 
import * as TwitchIrc from "https://deno.land/x/twitch_irc@0.11.0/mod.ts";
import { ChannelRole } from "https://deno.land/x/twitch_irc@0.11.0/mod.ts";
import { Application, Router } from "https://deno.land/x/oak/mod.ts";

//= = = my own variables = = =
// CHANNEL NAME
const channel = "#kirinokirino";

// is bot active?
let botActive = true;

const enum COMMANDS {
  //start bot
  botStart = "start",
  //end bot
  botEnd = "exit",
  //clear users in this session
  clearUsers = "clearUsers",
  deleteUser = "deleteUser",
  deleteEveryUser = "deleteEveryUser",
  messageCount = "messages",
}

// = = = construction: users database in data/users = = =
const USER_ALLOW_LIST: string[] = [];
const DATA_DIR = "./data";
const USER_DATA_DIR = DATA_DIR + "/users";

type UnhandledCommand = {
  command: string;
  args: string[];
  argUsers: string[];
};

type User = {
  name: string;
  displayName: string;
  messageCount: number;
  color: string;
  xp: number;
  unhandledCommands?: UnhandledCommand[];
};

type Users = {
  [name: string]: User;
};

type Emote = {
  name: string;
  id: string;
};

type Messages = {
  [name: string]: string[];
};

const users: Users = loadUsers();
let activeUsers: string[] = [];
let newEmotes: Emote[] = [];
let newMessages: Messages = {};

function loadUsers(): Users {
  const users: Users = {};
  const decoder = new TextDecoder("utf-8");
  let dir: Iterable<Deno.DirEntry> = [];
  try {
    dir = Deno.readDirSync(USER_DATA_DIR);
  } catch (e) {
    if (e instanceof Error) {
      if (e.name === "NotFound") {
        console.error(`Couldn't find directory {USER_DATA_DIR}!`);
        return {};
      }
    }
  }
  for (const file of dir) {
    const user = JSON.parse(
      decoder.decode(Deno.readFileSync(`${USER_DATA_DIR}/${file.name}`)),
    ) as User;
    if (USER_ALLOW_LIST.length === 0 || USER_ALLOW_LIST.includes(user.name)) {
      users[user.name] = user;
    }
  }
  return users;
}

function userFile(username: string): string {
  return `${USER_DATA_DIR}/${username}.json`;
}

function deleteUser(username: string) {
  delete users[username];
  Deno.removeSync(userFile(username));
}

function deleteEveryUser() {
  const usernames = Object.keys(users);
  for (const username of usernames) {
    deleteUser(username);
  }
}

function saveUser(username: string) {
  Deno.writeTextFileSync(userFile(username), JSON.stringify(users[username]));
}

function searchUser(query: string): string | undefined {
  if (query.startsWith("@")) {
    query = query.replace("@", "");
  }
  let user = users[query];
  if (!user) {
    for (const [username, userTags] of Object.entries(users)) {
      if (userTags.displayName == query) {
        return username;
      }
    }
  } else {
    return query;
  }
}

// = = = TwitchIrc = = =
const client = new TwitchIrc.Client();

client.on("open", async () => {
  await client.join(channel);
  console.log("joined", channel);
});
/*
32 Moscowwbish:	`raw` is the raw message, you can use it to get raw tags as `t.raw.tags.tagNameInCamelCase`
33 Moscowwbish:	or use `t.raw.tag("tagNameInCamelCase")` which accepts a 2nd parameter that accepts the kind of value you want to convert to
34 Moscowwbish:	for example `t.raw.tag("emotes", "csv")` is how the `privmsg.emotes` is parsed
*/
client.on("privmsg", ({ message, emotes, sentAt, user, raw, ...rest }) => {
  const { login, role, badges, displayName, color, ..._ } = user;
  const username = login;
  console.log(displayName, "[", ChannelRole[role], "]", message);
  if (USER_ALLOW_LIST.length > 0 && !USER_ALLOW_LIST.includes(username)) {
    return;
  }
  if (botActive) {
    // detect user chatting as a participator of the game
    // first, save the user in the db if they weren't yet
    if (!(username in users)) {
      users[username] = {
        name: username,
        displayName,
        messageCount: 0,
        color,
        xp: 0,
      } as User;
    }
    // same, but for new users in current session aka current stream
    if (!(username in activeUsers)) {
      activeUsers.push(username);
    }

    const detectedCommand = message.match(/^!([\w]+)($|\s.*)/);

    if (detectedCommand) {
      const command = detectedCommand[1];
      const args = detectedCommand[2].split(/\s+/);
      const argUsers = args
        .map((arg) => {
          const username = searchUser(arg);
          return username;
        })
        .filter((user) => user != undefined) as string[];
      let handled = true;

      if (role === ChannelRole.Moderator || role === ChannelRole.Streamer) {
        // MOD/BROADCASTER COMMANDS
        if (command === COMMANDS.clearUsers) {
          activeUsers = [username];
          handled = false;
        } else if (command === COMMANDS.botStart) {
          botActive = true;
        } else if (command === COMMANDS.botEnd) {
          botActive = false;
        } else if (command === COMMANDS.deleteUser) {
          for (const username of argUsers) {
            deleteUser(username);
          }
        } else if (
          command === COMMANDS.deleteEveryUser &&
          displayName === channel
        ) {
          deleteEveryUser();
        } else if (command === COMMANDS.messageCount) {
          for (const username of argUsers) {
            console.log(
              `${users[username].displayName} has written ${
                users[username].messageCount
              } messages`,
            );
          }
        } else {
          handled = false;
        }
      } else {
        handled = false;
      }

      // not handled command
      if (!handled) {
        // pay the price for the command;
        let payed = false;
        if (command == "bonk") {
          if (users[username].xp >= 60) {
            users[username].xp -= 60;
            payed = true;
          }
        } else if (command == "hug") {
          if (users[username].xp >= 30) {
            users[username].xp -= 30;
            payed = true;
          }
        } else {
          // pass through the unknown commands
          payed = true;
        }
        // Pass all the unknown commands (starting with ! ) to the frontend
        // in hopes that it knows what to do with them.
        if (payed) {
          if (users[username].unhandledCommands) {
            users[username].unhandledCommands!.push({
              command: command,
              args: args,
              argUsers: argUsers,
            });
          } else {
            users[username].unhandledCommands = [
              {
                command: command,
                args: args,
                argUsers: argUsers,
              },
            ];
          }
        }
      }
    } else {
      // no command detected
      // counts messages written by the user and gives xp
      users[username].messageCount += 1;
      users[username].xp += 15;
      if (emotes.length === 0) {
        // NOT A COMMAND
        if (newMessages[username]) {
          newMessages[username].push(message);
        } else {
          newMessages[username] = [message];
        }
      } else {
        // console.log(emotes);
        // console.log(raw.tags?.emotes);
        for (let emote of emotes) {
          for (let range of emote.ranges) {
            newEmotes.push({
              name: username,
              id: emote.id,
            });
          }
        }
        // for each emote in message
        // emote[1] = { who: kirinokirino, id: 65}
        // emote[2] = { who: kirinokirino, id: 65}
        // emote[3] = { who: kirinokirino, id: 46636}
      }
    }
    // save that as a json file then
    saveUser(username);
  }
});

// COMMUNICATION WITH THE FRONTEND
const app = new Application();
const router = new Router();

// what port do we run on?
const port = 2501;
// where is our frontend
app.use(async (Context, next) => {
  try {
    await Context.send({ root: "../frontend", index: "index.html" });
  } catch {
    await next();
  }
});

router
  .get("/dbg", (context) => {
    let filteredUsers: Users = {};
    for (const name of activeUsers) {
      filteredUsers[name] = users[name];
    }
    context.response.body = {
      users: users,
      active: activeUsers,
      filtered: filteredUsers,
    };
  })
  // send over the info inside the users variable
  .get("/users", (context) => {
    let filteredUsers: Users = {};
    for (const name of activeUsers) {
      filteredUsers[name] = users[name];
    }
    context.response.body = {
      users: filteredUsers,
      emotes: newEmotes,
      messages: newMessages,
    };
    for (const user of activeUsers) {
      users[user].unhandledCommands = [];
    }
    newEmotes = [];
    newMessages = {};
  });

app.use(router.routes());
app.use(router.allowedMethods());
await app.listen({ port });
