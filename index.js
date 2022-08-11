const tmi = require('tmi.js');

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

const client = new tmi.client(options);

client.connect();

client.on('connected', (address, port) => {
    console.log("Connected to chat!");
})