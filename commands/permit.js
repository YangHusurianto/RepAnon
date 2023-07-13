const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

require('dotenv').config();

module.exports = function(repDB) {
	return {
		data: new SlashCommandBuilder()
			.setName('permit')
			.setDescription('Allow a role or user to check rep')
			.addMentionableOption(option => option.setName('target').setDescription("Target to permit"))
			.setDMPermission(false),
		async execute(interaction) {
			if (!interaction.memberPermissions.has(PermissionsBitField.Flags.ADMINISTRATOR)) {
				await interaction.reply("You do not have permission to run this command!");
			}
		},
	};
};	