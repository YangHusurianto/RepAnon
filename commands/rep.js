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
			let rep = await repDB.get(target.id);

			if (!rep) {
				await repDB.set(target.id, 0);
				rep = 0;
			}

			const repEmbed = new EmbedBuilder()
				.setColor(0x29b2ff)
				.setTitle(`${target.username} has ${rep} rep`)
				.setAuthor({name: `${target.username}`, iconURL: `${target.avatarURL()}`});

			await interaction.reply({ embeds: [repEmbed] });
		},
	};
};	