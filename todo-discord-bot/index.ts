import { Client, Events, GatewayIntentBits } from "discord.js";
import { handleTodoCommand } from "./commands/todo";

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once(Events.ClientReady, (c) => {
  console.log(`Bot listo como ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "todo") {
    await handleTodoCommand(interaction);
  }
});

client.login(process.env.DISCORD_TOKEN);
