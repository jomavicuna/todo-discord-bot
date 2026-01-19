import { Client, Events, GatewayIntentBits } from "discord.js";
import { handleTodoCommand } from "./commands/todo";
import { handleStatsCommand } from "./commands/stats";
import { loadThreadCache, isThreadTracked, updateThreadActivity } from "./lib/supabase";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.once(Events.ClientReady, async (c) => {
  console.log(`Bot listo como ${c.user.tag}`);
  await loadThreadCache();
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  try {
    if (interaction.commandName === "todo") {
      await handleTodoCommand(interaction);
    } else if (interaction.commandName === "stats") {
      await handleStatsCommand(interaction);
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

// Track activity in todo threads
client.on(Events.MessageCreate, async (message) => {
  // Ignore bots
  if (message.author.bot) return;

  // Only process threads
  if (!message.channel.isThread()) return;

  // Check if this thread is tracked
  if (isThreadTracked(message.channel.id)) {
    await updateThreadActivity(message.channel.id);
  }
});

client.login(process.env.DISCORD_TOKEN);
