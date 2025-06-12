const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Magisterium } = require('magisterium');
require('dotenv').config();

const magisterium = new Magisterium({
    apiKey: process.env.MAGISTERIUM_API_KEY,
});

let isProcessing = false;
let userConversations = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ask')
    .setDescription(`Ask NewmanBot a question about the Catholic Faith! (Powered by Magisterium AI)`)
    .addStringOption(option =>
      option.setName('question')
        .setDescription('What do you want to ask the AI?')
        .setRequired(true)
    ),

  async execute(interaction, client) {

    await interaction.deferReply();

    if (isProcessing) {
        await interaction.editReply({
            embeds: [
                {
                    description: '❌ Please wait - another prompt is being processed.',
                    color: 0xFF0000
                }
            ],
            ephemeral: true
        });
        return;
    }

    isProcessing = true;

    const userId = interaction.user.id;

    if (!userConversations.has(userId)) {
        userConversations.set(userId, []);
    }   

    const conversation = userConversations.get(userId);

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

    const question = interaction.options.getString('question');

    conversation.push({ role: 'user', content: question });

    if (conversation.length > 10) {
        conversation.shift();
    }

    let results;
    try {
        results = await magisterium.chat.completions.create({
            model: "magisterium-1",
            messages: conversation,
        });
    }
    catch (e) {
        await interaction.editReply({
            embeds: [
                {
                    description: `❌ Error generating Message: Code ${e.code}`,
                    color: 0xFF0000
                }
            ],
            ephemeral: true
        });
        return;
    }

    conversation.push({ role: 'assistant', content: results.choices[0].message.content });
    
    let response = `***${interaction.user.username}:*** **${question}**\n\n**Response:** ${results.choices[0].message.content}`

    function convertCitationsToSuperscript(text) {
        return text.replace(/\[\^(\d+)\]/g, (_, num) => {
            let superscriptNum = ''
            for (let digit of num) {
                superscriptNum += superscriptMap[digit] || digit;
            }
            return superscriptNum;
        });
    }

    response = convertCitationsToSuperscript(response)

    function splitMessage(text, maxLength = 4096) {
        const parts = [];
        let start = 0;
        
        while (start < text.length) {
            let end = start + maxLength;
            if (end >= text.length) {
                parts.push(text.slice(start));
                break;
            }
            
            let lastSpace = text.lastIndexOf(' ', end);
            if (lastSpace <= start) lastSpace = end;

            parts.push(text.slice(start, lastSpace));
            start = lastSpace + 1;
        }
        return parts;
    }

    messageParts = splitMessage(response);
    
    let embeds = messageParts.map((desc, index) => 
        new EmbedBuilder()
            .setTitle('Magisterium AI')
            .setColor(0xEFBF04)
            .setDescription(desc)
            .setFooter({ text: `Part ${index + 1} of ${messageParts.length}` })
    );

    const citations = results.citations

    if (citations.length > 0) {
        let citationsReply = '**Citations:**\n'
        for (const citation of citations) {
            citationsReply += `**${citation.document_index + 1}:** [${citation.document_title || citation.document_index + 1}](${citation.source_url})\n`;
        }

        citationsMessageParts = splitMessage(citationsReply)

        citationEmbeds = citationsMessageParts.map((desc, index) => 
            new EmbedBuilder()
                .setTitle(`Citations`)
                .setColor(0xEFBF04)
                .setDescription(desc)
                .setFooter({ text: `Part ${index + 1} of ${citationsMessageParts.length}` })
        );

        embeds = embeds.concat(citationEmbeds);

    }

    let batch = [];
    let currentLength = 0;
    let first = true;

    for (let i = 0; i < embeds.length; i++) {

        const embed = embeds[i].data;

        const titleLength = embed.title ? embed.title.length : 0;
        const descLength = embed.description ? embed.description.length : 0;
        const footerLength = embed.footer?.text ? embed.footer.text.length : 0;

        const embedSize = titleLength + descLength + footerLength;

        console.log(embedSize)

        if (currentLength + embedSize > 6000 && batch.length > 0) {
            if (first) {
                await interaction.editReply({embeds: batch});
                first = false;
            }
            else {
                await interaction.followUp({embeds: batch})
            }
            batch = [];
            currentLength = 0;
        }
        batch.push(embeds[i]);
        currentLength += embedSize;
    }

    if (batch.length > 0) {
        if (first) {
            await interaction.editReply({ embeds: batch });
        } 
        else {
            await interaction.followUp({ embeds: batch });
        }
    }   

    isProcessing = false;


  },
};
