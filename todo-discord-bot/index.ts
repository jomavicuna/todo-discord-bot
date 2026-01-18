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

  try {
    if (interaction.commandName === "todo") {
      await handleTodoCommand(interaction);
    }
  } catch (error) {
    console.error("Error handling command:", error);
    const errorMessage = "❌ Ocurrió un error al procesar el comando.";
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(errorMessage);
    } else {
      await interaction.reply(errorMessage);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
