const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = function(repDB) {
	return {
		data: new SlashCommandBuilder()
			.setName('rep')
			.setDescription("Check a user's rep")
			.addUserOption(option =>
				option
					.setName('user')
					.setDescription('The user to get the rep of')
					.setRequired(true)),
		async execute(interaction) {
			let allowed = false;

			// check if user has direct permission (check first to prevent checking every role)
			const allowedUsers = await repDB.get("allowedUsers");
			if (allowedUsers.indexOf(interaction.user.id) >= 0) {
				allowed = true;
			}

			if (!allowed) { // remove redundant checking
				// check if user has permission through roles
				const allowedRoles = await repDB.get("allowedRoles");
				const userRoles = interaction.member.roles.cache;
				allowedRoles.forEach(allowedRole => {
					if (!userRoles.get(allowedRole)) {
						allowed = true;
					}
				});
			}

			// if user not permitted
			if (!allowed) {
				await interaction.reply({ content: "You do not have permission to run this command!", ephemeral: true });
				return;
			}

			const target = interaction.options.getUser('user');
			let repData = await repDB.get(target.id);

			// if user data doesnt already exist, create
			if (!repData) {
				let initialData = { rep:0, givenPos:[], givenNeg:[] };
				await repDB.set(target.id, initialData);
				repData = initialData;
			}

			let repColor = 0xbbbbbb;

			if (repData.rep > 0) repColor = 0x29b2ff; //positive color
			if (repData.rep < 0) repColor = 0xba2222; //negative color

			const repEmbed = new EmbedBuilder()
				.setColor(repColor)
				.setTitle(`${target.username} has ${repData.rep} rep`)
				.setAuthor({name: `${target.username}`, iconURL: `${target.avatarURL()}`});

			await interaction.reply({ embeds: [repEmbed] });
		},
	};
};	