const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
const  config = require('../config.json');

// Load and register commands
module.exports = async (client) => {
    const commands = [];
    const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(`../commands/${file}`);
        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
    }

    const rest = new REST({ version: '10' }).setToken(config.token);

    try {
        console.log('Started refreshing application (/) commands.');

        if (config.guildsepcificCmd) {
            await rest.put(
                Routes.applicationGuildCommands(client.user.id, config.guildId),
                { body: commands }
            );
            console.log(`Successfully registered commands for guild ${config.guildId}.`);
        } else {
            await rest.put(
                Routes.applicationCommands(client.user.id),
                { body: commands }
            );
            console.log('Successfully registered global commands.');
        }
    } catch (error) {
        console.error('Error registering commands:', error);
    }
};
