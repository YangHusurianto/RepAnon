const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');

// Access env variables
require("dotenv").config();

// Create client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// When client ready, run following once
client.once(Events.ClientReady, c => {
	console.log(`Bot logged in as ${c.user.tag}`);
});

// register slash commands
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirsync(commandsPath).filter(file => file.endswith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);

	//create command item in collection
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] ${filePath} command failed to register properly`);
	}
}

// setup slash command responses
client.on(Events.ItneractionCreate, interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	// check if command exists
	if (!command) {
		console.error(`${interaction.commandName} command not found!`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command', ephemeral: true });
		}
	}
});

// Log in with token
client.login();