const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('giveRep')
		.setDescription('Give another user rep')
		.addUserOption(option =>
			option
				.setName('target')
				.setDescription('The user to get the rep of'))
				.setRequired(true),
	async execute(interaction) {
		const target = interaction.options.getUser('target');

		await interaction.reply(`Successfully given ${target.user} 1 rep!`);
		await interaction.deleteReply();
	},
};	