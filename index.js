const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { token } = require('./config.json');
const commandHandler = require('./handlers/commandHandler');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    commandHandler(client); // Load and register commands
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.login(token);
