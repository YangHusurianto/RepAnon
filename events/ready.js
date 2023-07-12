const { Events } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		// set bot avatar
		client.user.setAvatar('./avatar.png')
			.then(user => console.log(`New avatar set!`))
			.catch(console.error);
  
		console.log(`Bot logged in as ${client.user.tag}`);
	}
}