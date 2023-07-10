const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = function(repDB) {
	return {
		data: new SlashCommandBuilder()
			.setName('rep')
			.setDescription('Check your own rep or another user\'s rep')
			.addUserOption(option =>
				option
					.setName('target')
					.setDescription('The user to get the rep of')),
		async execute(interaction) {
			const target = interaction.options.getUser('target') ?? interaction.user;
			let repData = await repDB.get(target.id);

			if (!repData) {
				let initialData = { id:target.id, rep:0, givenPos:[], givenNeg:[] };
				await repDB.set(target.id, initialData);
				repData = initialData;
			}

			const repEmbed = new EmbedBuilder()
				.setColor(0x29b2ff)
				.setTitle(`${target.username} has ${repData.rep} rep`)
				.setAuthor({name: `${target.username}`, iconURL: `${target.avatarURL()}`});

			await interaction.reply({ embeds: [repEmbed] });
		},
	};
};	