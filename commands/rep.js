const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rep')
		.setDescription('Check your own rep or another user\'s rep')
		.addUserOption(option =>
			option
				.setName('target')
				.setDescription('The user to get the rep of')),
	async execute(interaction) {
		const target = interaction.options.getUser('target') ?? interaction.user;

		const repEmbed = new EmbedBuilder()
			.setColor(0x29b2ff)
			.setTitle('x rep')
			// .setDescription('x rep')
			.setAuthor({name: `${target.username}`, iconURL: `${target.avatarURL()}`})

		await interaction.reply({ embeds: [repEmbed] });
	},
};	