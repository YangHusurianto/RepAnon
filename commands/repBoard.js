const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

require('dotenv').config();

module.exports = function(repDB) {
	return {
		data: new SlashCommandBuilder()
			.setName('repboard')
			.setDescription('See the top 10 users'),
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
				users.push({ id: key, rep: value.rep });
			}

			const sortedUsers = users.sort((a, b) => (a.rep > b.rep) ? 1 : -1);

			const repEmbed = new EmbedBuilder()
				.setColor(repColor)
				.setTitle(`Top 10 Rep in ${guild.name}`)
				.addFields(
					sortedUsers.flatMap((user, i) => {
						if (i > 10) return [];

						return {
							name: user.id,
							value: `${user.rep} rep`
						};
					})
				);

			await interaction.reply({ embeds: [repEmbed] });
		},
	};
};	