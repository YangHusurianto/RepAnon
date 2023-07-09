const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rep')
		.setDescription('Check your own rep or another user\'s rep'),
	async execute(interaction) {
		await interaction.reply(`${interaction.user.username} has x rep.`);
	},
};