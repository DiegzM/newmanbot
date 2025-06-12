const path = require('path');
const { Collection } = require ('discord.js');
const fileLoader = require('../utils/fileLoader');

module.exports = (client) => {
    const commandsPath = path.join(__dirname, '..', 'commands');
    const commandFiles = fileLoader(commandsPath);

    client.commands = new Collection();
    
    for (const file of commandFiles) {
        const command = require(file)
        client.commands.set(command.data.name, command)
    }
};