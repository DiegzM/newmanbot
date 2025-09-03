const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Magisterium } = require('magisterium');
require('dotenv').config();

const url = 'https://bible-api.com/data/dra';

const superscriptMap = {
    '0': '⁰',
    '1': '¹',
    '2': '²',
    '3': '³',
    '4': '⁴',
    '5': '⁵',
    '6': '⁶',
    '7': '⁷',
    '8': '⁸',
    '9': '⁹'
};

function toSuperscript(number) {
    return String(number).split('').map(digit => superscriptMap[digit] || '').join('');
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bible')
    .setDescription(`Get verses from the DRA Bible!`)
    .addStringOption(option =>
        option.setName('book')
            .setDescription('The book to retrieve from (full name, case-insensitive)')
            .setRequired(true)
    )
    .addIntegerOption(option =>
        option.setName('chapter')
        .setDescription('The chapter of the book to retrieve from')
        .setRequired(true)
    )
    .addIntegerOption(option =>
        option.setName('startverse')
        .setDescription('The verse to start reading from')
        .setRequired(true)
    )
    .addIntegerOption(option =>
        option.setName('endverse')
        .setDescription('The verse to stop reading at (optional)')
        .setRequired(false)
    ),

  async execute(interaction, client) {

        await interaction.deferReply();

        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error('Failed to fetch Bible data');

            const data = await res.json();

            let bookInput = interaction.options.getString('book');
            let chapter = interaction.options.getInteger('chapter');
            let startverse = interaction.options.getInteger('startverse');
            let endverse = interaction.options.getInteger('endverse');

            let bookDetails = data.books.find(b => b.name.toLowerCase() === bookInput.toLowerCase())

            if (!bookDetails) throw new Error('Book not found in Bible data, did you misspell it?');

            let book = bookDetails.name;
            let bookUrl = bookDetails.url

            const bookRes = await fetch(bookUrl);
            if (!bookRes.ok) throw new Error('Failed to fetch Bible data');

            const bookData = await bookRes.json();

            chapter = Math.min(Math.max(chapter, 1), bookData.chapters.length);
            
            let chapterDetails = bookData.chapters[chapter - 1];
            let chapterUrl = chapterDetails.url;

            const chapterRes = await fetch(chapterUrl);
            if (!chapterRes.ok) throw new Error(`Failed to fetch ${book} chapter data`);

            const chapterData = await chapterRes.json();

            startverse = Math.min(Math.max(startverse, 1), chapterData.verses.length);
            if (endverse) {
                if (endverse <= startverse) endverse = undefined;
                else endverse = Math.min(Math.max(endverse, startverse), chapterData.verses.length);
            }

            let selectedVerses = chapterData.verses.filter(v => 
                endverse
                    ? v.verse >= startverse && v.verse <= endverse 
                    : v.verse === startverse
            );

            let verseText = selectedVerses
                .map(v => `${toSuperscript(v.verse)}${v.text}`)
                .join(' ');

            if (verseText.length > 4096) throw new Error('Verse selection is too long to display. Please select a smaller range');

            embed = new EmbedBuilder()
                .setTitle(`${book} ${chapter}:${startverse}${endverse ? `-${endverse}` : ''}`)
                .setColor(0xEFBF04)
                .setDescription(verseText)
        
            await interaction.editReply({embeds: [embed]});
            
        }
        catch (e) {
            console.error(e)
            await interaction.editReply({
                embeds: [
                    {
                        description: `❌ Error: ${e.message || 'Error fetching Bible verse'}`,
                        color: 0xFF0000
                    }
                ],
                ephemeral: true
            });
            return;
        }

  },
};
