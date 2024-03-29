const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const chalk = require('chalk');

module.exports = (client) => {
    client.handleCommands = async () => {
        const commandFolders = fs.readdirSync('./commands');

        for (const folder of commandFolders) {
            const commandFiles = fs.readdirSync(`./commands/${folder}`).filter((file) => file.endsWith('.js'));

            const { commands, commandArray } = client;
            for (const file of commandFiles) {
                const command = require(`../../commands/${folder}/${file}`);
                commands.set(command.data.name, command);
                commandArray.push(command.data.toJSON());
                console.log(`Command : ${chalk.green(command.data.name)}`);
            }
        }

        const clientId = '1018228450273788014';
        const guildId = '989595393778126919';
        const rest = new REST({ version: '9' }).setToken(process.env.token);

        try {
            console.log(chalk.cyan('Started refreshing application (/) commands.'));

            await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
                body: client.commandArray,
            });

            console.log(chalk.green('Successfully reloaded application (/) commands.'))
        } catch (error) {
            console.error(error);
        }

    }
}