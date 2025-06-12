const path = require('path');
const fileLoader = require('../utils/fileLoader');

module.exports = (client) => {
    const eventsPath = path.join(__dirname, '..', 'events');
    const eventFiles = fileLoader(eventsPath);

    for (const filePath of eventFiles) {
        const event = require(filePath);

        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        }
        else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }
    }
};