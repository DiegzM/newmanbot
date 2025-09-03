module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(message, client) {
        if (message.author.bot) return;
        const word = "god is good";
        
        if (message.content.toLowerCase().includes(word)) {
            await message.reply("All the time!");
        }
    }
}