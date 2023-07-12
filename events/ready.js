const { Events } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		// set bot avatar
		client.user.setAvatar('./avatar.png')
		console.log(`Bot logged in as ${client.user.tag}`);
	}
}