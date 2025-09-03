const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Magisterium } = require('magisterium');
require('dotenv').config();

const url = 'https://bible-api.com/data/dra/random';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('randomverse')
    .setDescription(`Get a random verse from the DRA Bible!`),

  async execute(interaction, client) {

        await interaction.deferReply();

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch verse');

            const data = await response.json();
            const verse = data.random_verse;

            embed = new EmbedBuilder()
                .setTitle(`${verse.book} ${verse.chapter}:${verse.verse}`)
                .setColor(0xEFBF04)
                .setDescription(`${verse.text}`)
        
            await interaction.editReply({embeds: [embed]});
        }
        catch (e) {
            console.error(e)
            await interaction.editReply({
                embeds: [
                    {
                        description: '❌ Error fetching Bible verse',
                        color: 0xFF0000
                    }
                ],
                ephemeral: true
            });
            return;
        }

  },
};
