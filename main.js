require('dotenv').config();
const { token, mongoToken } = process.env;
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const { connect } = require('mongoose');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
client.commands = new Collection();
client.commandArray = [];

const functionFolders = fs.readdirSync('./functions');
for (const folder of functionFolders) {
    const functionFiles = fs.readdirSync(`./functions/${folder}`).filter((file) => file.endsWith(".js"));

    for (const file of functionFiles) require(`./functions/${folder}/${file}`)(client);
}

client.handleEvents();
client.handleCommands();
client.login(token);
(async () => {
    await connect(mongoToken).catch(console.error);
})();