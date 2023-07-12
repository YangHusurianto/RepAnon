const { SlashCommandBuilder } = require('discord.js');

require('dotenv').config();

module.exports = function(repDB) {
	return {
		data: new SlashCommandBuilder()
			.setName('giverep')
			.setDescription('Give another user rep')
			.addSubcommand(subcommand => 
				subcommand
					.setName('mention')
					.setDescription('Provide a mention to give rep to')
					.addUserOption(option => option.setName('mentiontarget').setDescription('The user mention to give rep to').setRequired(true))
					.addIntegerOption(option => option.setName('type').setDescription("Positive or negative rep").setRequired(true)
						.addChoices(
							{ name: 'Positive', value: 1 },
							{ name: 'Negative', value: 0 },
						)))
			.addSubcommand(subcommand => 
				subcommand
					.setName('username')
					.setDescription('Provide a username to give rep to')
					.addStringOption(option => option.setName('usernametarget').setDescription('The username to give rep to').setRequired(true))
					.addIntegerOption(option => option.setName('type').setDescription("Positive or negative rep").setRequired(true)
						.addChoices(
							{ name: 'Positive', value: 1 },
							{ name: 'Negative', value: 0 },
						))),
		async execute(interaction) {
			// defer reply for discord
			await interaction.deferReply({ ephemeral: true });

			// ensure that the user is in the rep server (GUILD_ID)
			const guild = interaction.client.guilds.cache.get(process.env.GUILD_ID);

			if (!guild) {
				await interaction.editReply(`You must be in the ${guild.name} server to give rep to others.`);
			}

			let target;
			const mentiontarget = interaction.options.getUser('mentiontarget');
			const usernametarget = interaction.options.getString('usernametarget');

			if (!mentiontarget && !usernametarget) {
				await interaction.editReply('Please mention a user or type their username.');
				return;
			}

			// default target the mention, if specified username, change to
			target = mentiontarget;

			if (usernametarget) {
				// search through guild for user
				let users = await guild.members.fetch({ query: interaction.options.getString('usernametarget') })
					.catch(console.error);

				if (users.size > 1) {
					await interaction.editReply("Too many users found with that username, please be more specific.");
					return;
				}
				if (users.size == 0) {
					await interaction.editReply("No user found with that username.");
					return;
				}

				target = users.at(0).user;
			}

			// ensure users cant give themselves rep
			if (target.id == interaction.user.id) {
				await interaction.editReply("You can't give yourself rep!");
				return;
			}

			// value to modify rep by
			let repValue = interaction.options.getInteger('type');

			// ensure target data exists
			let repData = await repDB.get(target.id);
			if (!repData) {
				let initialData = { rep:0, givenPos:[], givenNeg:[] };
				await repDB.set(target.id, initialData);
				repData = initialData;
			}

			// check if user has already given rep
			if (repValue) {
				// if the user has already given the target positive rep
				if (repData.givenPos.includes(interaction.user.id)) {
					await interaction.editReply("You have already given this user positive rep!");
					return;
				}

				// if the user has given negative rep in the past
				if (repData.givenNeg.includes(interaction.user.id)) {
					repData.givenNeg = repData.givenNeg.filter(id => id !== interaction.user.id);
					repData.rep += 1;
					await repDB.set(target.id, repData);
					await interaction.editReply(`Given ${target.username} neutral rep!`);
					return;
				}

				// if the user has given neither pos/neg rep 
				repData.givenPos.push(interaction.user.id);
				repData.rep += 1;
				await repDB.set(target.id, repData);
				await interaction.editReply(`Given ${target.username} positive rep!`);
			} else if (!repValue) {

				// if the user has already given the target negative rep
				if (repData.givenNeg.includes(interaction.user.id)) {
					await interaction.editReply("You have already given this user negative rep!");
					return;
				}

				// if the user has given positive rep in the past
				if (repData.givenPos.includes(interaction.user.id)) {
					repData.givenPos = repData.givenPos.filter(id => id !== interaction.user.id);
					repData.rep -= 1;
					await repDB.set(target.id, repData);
					await interaction.editReply(`Given ${target.username} neutral rep!`);
					return;
				}

				// if the user has given neither pos/neg rep
				repData.givenNeg.push(interaction.user.id);
				repData.rep -= 1;
				await repDB.set(target.id, repData);
				await interaction.editReply(`Given ${target.username} negative rep!`);
			}
		},
	};
};	