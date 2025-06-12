require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fileLoader = require('./utils/fileLoader');
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const handlersPath = path.join(__dirname, '.', 'handlers');
const handlerFiles = fileLoader(handlersPath);

for (const file of handlerFiles) {
    require(file)(client);
}

client.login(process.env.TOKEN);