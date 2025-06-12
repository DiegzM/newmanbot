const path = require('path');
const { REST, Routes } = require ('discord.js');
const fileLoader = require('./utils/fileLoader');
require('dotenv').config();

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fileLoader(commandsPath);

for (const file of commandFiles) {
    const command = require(file);
    commands.push({
        name: command.data.name,
        description: command.data.description,
        options: command.data.options || []
    });
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();