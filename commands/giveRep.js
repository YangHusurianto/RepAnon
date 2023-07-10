const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

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
					.addUserOption(option => option.setName('mentiontarget').setDescription('The user mention to give rep to').setRequired(true)))
			.addSubcommand(subcommand => 
				subcommand
					.setName('username')
					.setDescription('Provide a username to give rep to')
					.addStringOption(option => option.setName('usernametarget').setDescription('The username to give rep to').setRequired(true))),
		async execute(interaction) {
			let target;
			const mentiontarget = interaction.options.getUser('mentiontarget');
			const usernametarget = interaction.options.getString('usernametarget');

			if (!mentiontarget && !usernametarget) {
				await interaction.reply({ content: 'Please mention a user or type their username.', ephemeral: true });
				return;
			}

			// default target the mention, if specified username, change to
			target = mentiontarget;

			if (usernametarget) {
				// search through guild for user
				const guild = interaction.client.guilds.cache.get(process.env.GUILD_ID);
				let users = await guild.members.fetch({ query: interaction.options.getString('usernametarget') })
					.catch(console.error);

				if (users.size > 1) {
					await interaction.reply("Too many users found with that username, please be more specific.");
					return;
				}
				if (users.size == 0) {
					await interaction.reply("No user found with that username.");
					return;
				}

				target = users.at(0).user;
			}

			// ensure users cant give themselves rep
			if (target.id == interaction.user.id) {
				await interaction.reply("You can't give yourself rep!");
				return;
			}

			// ensure target data exists
			let repData = await repDB.get(target.id);
			if (!repData) {
				let initialData = { id:target.id, rep:0, givenPos:[], givenNeg:[] };
				await repDB.set(target.id, initialData);
				repData = initialData;
			}

			// check if user has already given rep
			console.log(repData);
			if (repData.givenPos.includes(interaction.user.id)) {
				await interaction.reply("You have already given this user rep!");
				return;
			}

			repData.givenPos.push(interaction.user.id);
			repData.rep += 1;
			await repDB.set(target.id, repData);
			await interaction.reply(`Given ${target.username} one rep!`);
		},
	};
};	