const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

require('dotenv').config();

module.exports = function(repDB) {
	return {
		data: new SlashCommandBuilder()
			.setName('repboard')
			.setDescription('See the top 10 users')
			.addBooleanOption(option => option.setName('reverse').setDescription("Whether to show the top 10 or bottom 10")),
		async execute(interaction) {
			// defer reply for discord
			await interaction.deferReply();

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
				await interaction.editReply("You do not have permission to run this command!");
				return;
			}

			// ensure that the user is in the rep server (GUILD_ID)
			const guild = interaction.client.guilds.cache.get(process.env.GUILD_ID);

			if (!guild) {
				await interaction.editReply(`You must be in the ${guild.name} server to give rep to others.`);
				return;
			}

			let users = [];
			const keyKeys = ["allowedUsers", "allowedRoles"]; // special keyvs
			for await (const [key, value] of repDB.iterator()) {
				if (keyKeys.indexOf(key) >= 0) continue;
                guild.members.fetch(key)
                    .then(user => users.push({ nickname: user.nickname, rep: value.rep }));
			}

			let sortedUsers = users.sort((a, b) => (a.rep > b.rep) ? -1 : 1);
			let title = `Top 10 Rep in ${guild.name}`;
			if (interaction.options.getBoolean("reverse")) {
				title = `Bottom 10 Rep in ${guild.name}`;
				sortedUsers = users.sort((a, b) => (a.rep > b.rep) ? 1 : -1);
			}

			const repEmbed = new EmbedBuilder()
				.setTitle(title)
				.addFields(
					sortedUsers.flatMap((user, i) => {
						if (i > 10) return [];

						return {
							name: user.nickname,
							value: `${user.rep} rep`
						};
					})
				);

			await interaction.editReply({ embeds: [repEmbed] });
		},
	};
};	