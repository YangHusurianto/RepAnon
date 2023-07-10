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