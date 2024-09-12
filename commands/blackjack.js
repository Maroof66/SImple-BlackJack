const { SlashCommandBuilder } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle } = require('discord.js');
const { playBlackjack, calculateHandTotal } = require('../utils/blackjack');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('blackjack')
        .setDescription('Play a game of Blackjack'),
    cooldown: 40,
    async execute(interaction) {
        let url = "https://discord.gg/";
        await interaction.deferReply();
        const { user } = interaction;
        const game = playBlackjack(user.id);

        const formatCards = (cards) => cards.map(card => `${card.value}${card.suit}`).join(' ');

        const playerTotal = calculateHandTotal(game.playerCards);
        const dealerTotal = calculateHandTotal([game.dealerCards[0]]);

        const embed = new EmbedBuilder()
            .setTitle('Blackjack')
            .setDescription(
                `**Your cards:**\n [${formatCards(game.playerCards)}](${url}) (Total: [${playerTotal}](${url}))\n\n` +
                `**Dealer's face-up card:**\n [${formatCards([game.dealerCards[0]])} ?  ](${url}) (Total: [${dealerTotal}](${url}))`
            );

        const uniqueId = interaction.id;

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`hit_${uniqueId}`)
                    .setLabel('Hit')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(`stand_${uniqueId}`)
                    .setLabel('Stand')
                    .setStyle(ButtonStyle.Secondary)
            );

            await interaction.editReply({ embeds: [embed], components: [row] });
        const filter = i => i.user.id === user.id && i.customId.endsWith(uniqueId); 
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async i => {
            if (i.customId.startsWith('hit')) {
                game.playerHit();

                await i.deferUpdate(); 
                const updatedPlayerTotal = calculateHandTotal(game.playerCards);
                const dealerFaceUpTotal = calculateHandTotal([game.dealerCards[0]]);

                if (game.isGameOver) {
                    const finalDealerTotal = calculateHandTotal(game.dealerCards);
                    const finalEmbed = new EmbedBuilder()
                        .setTitle('Blackjack - Game Over')
                        .setDescription(
                            `**Your final cards:**\n [${formatCards(game.playerCards)}](${url}) (Total: [${updatedPlayerTotal}](${url}))\n\n` +
                            `**Dealer's final cards:**\n [${formatCards(game.dealerCards)}](${url}) (Total: [${finalDealerTotal}](${url}))\n\n` +
                            `**Result:**\n ${game.result}`
                        );
                    const disabledRow = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`hit_${uniqueId}`)
                                .setLabel('Hit')
                                .setStyle(ButtonStyle.Primary)
                                .setDisabled(true),
                            new ButtonBuilder()
                                .setCustomId(`stand_${uniqueId}`)
                                .setLabel('Stand')
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(true)
                        );

                    await i.editReply({ embeds: [finalEmbed], components: [disabledRow] });
                } else {
                    const newEmbed = new EmbedBuilder()
                        .setTitle('Blackjack')
                        .setDescription(
                            `**Your cards:**\n [${formatCards(game.playerCards)}](${url}) (Total: [${updatedPlayerTotal}](${url}))\n\n` +
                            `**Dealer's face-up card:**\n [${formatCards([game.dealerCards[0]])} ?](${url}) (Total: [${dealerFaceUpTotal}](${url}))`
                        );

                    await i.editReply({ embeds: [newEmbed], components: [row] });
                }
            } else if (i.customId.startsWith('stand')) {
                game.dealerPlay();
                await i.deferUpdate();
                const finalPlayerTotal = calculateHandTotal(game.playerCards);
                const finalDealerTotal = calculateHandTotal(game.dealerCards);

                const finalEmbed = new EmbedBuilder()
                    .setTitle('Blackjack - Game Over')
                    .setDescription(
                        `**Your final cards:**\n [${formatCards(game.playerCards)}](${url}) (Total: [${finalPlayerTotal}](${url}))\n\n` +
                        `**Dealer's final cards:**\n [${formatCards(game.dealerCards)}](${url}) (Total: [${finalDealerTotal}](${url}))\n\n` +
                        `**Result:**\n ${game.result}`
                    );

                const disabledRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`hit_${uniqueId}`)
                            .setLabel('Hit')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(true),
                        new ButtonBuilder()
                            .setCustomId(`stand_${uniqueId}`)
                            .setLabel('Stand')
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(true)
                    );

                await i.editReply({ embeds: [finalEmbed], components: [disabledRow] });
            }
        });

        collector.on('end', async collected => {
            if (collected.size === 0) {
                const timeoutRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`hit_${uniqueId}`)
                            .setLabel('Hit')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(true),
                        new ButtonBuilder()
                            .setCustomId(`stand_${uniqueId}`)
                            .setLabel('Stand')
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(true)
                    );
                await interaction.editReply({content:".", embeds: [], components: [] });
            }
        });
    }
};
