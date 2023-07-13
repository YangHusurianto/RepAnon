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
			if (!interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator)) {
				await interaction.reply("You do not have permission to run this command!");
			}

			const mention = interaction.options.getMentionable('target');
			if (mention.hasOwnProperty('id')) { // check if mention was a role
				let allowedRoles = await repDB.get("allowedRoles");

				// if allowedRoles doesnt exist
				if (!allowedRoles) allowedRoles = [];

				allowedRoles.push(mention.id);
				await repDB.set("allowedRoles", allowedRoles);
				await interaction.reply(`The <@&${mention.id}> role has been added to the permit list.`);
			} else { // else if mention was an user
				let allowedUsers = await repDB.get("allowedUsers");

				// if allowedUsers doesnt exist
				if (!allowedUsers) allowedUsers = [];

				allowedUsers.push(mention.user.id);
				await repDB.set("allowedUsers", allowedUsers);
				await interaction.reply(`<@${mention.user.id}> has been added to the permit list.`);
			}

		},
	};
};	