const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Magisterium } = require('magisterium');
const cheerio = require('cheerio');
require('dotenv').config();

const url = 'https://bible.usccb.org/daily-bible-reading';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

async function scrapeReadings() {
    try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const html = await resp.text();
        const $ = cheerio.load(html);
    }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dailyreading')
    .setDescription(`Get today's daily reading!`),

  async execute(interaction, client) {

        await interaction.deferReply();

        const now = new Date();

        try {
            
        }
        catch (e) {
            console.error(e)
            await interaction.editReply({
                embeds: [
                    {
                        description: '❌ Error fetching daily reading',
                        color: 0xFF0000
                    }
                ],
                ephemeral: true
            });
            return;
        }

        console.log(readings);

        embed = new EmbedBuilder()
            .setTitle(`Daily reading for ${daysOfWeek[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()} ${now.getFullYear()}`)
            .setColor(0xEFBF04)
            .setDescription("Test")
        
        await interaction.editReply({embeds: [embed]});
  },
};
