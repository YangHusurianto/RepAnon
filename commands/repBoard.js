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

			// ensure that the user is in the rep server (GUILD_ID)
			const guild = interaction.client.guilds.cache.get(process.env.GUILD_ID);

			if (!guild) {
				await interaction.editReply(`You must be in the ${guild.name} server to give rep to others.`);
			}

			let users = [];
			for await (const [key, value] of repDB.iterator()) {
                guild.members.fetch(key)
                    .then(user => users.push({ nickname: user.nickname, rep: value.rep }));
			}

			const sortedUsers = (interaction.options.getBoolean("reverse") 
								? users.sort((a, b) => (a.rep > b.rep) ? 1 : -1)
								: users.sort((a, b) => (a.rep > b.rep) ? -1 : 1);

			const repEmbed = new EmbedBuilder()
				.setTitle(`Top 10 Rep in ${guild.name}`)
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