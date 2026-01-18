import { REST, Routes, SlashCommandBuilder } from "discord.js";

const commands = [
  new SlashCommandBuilder()
    .setName("todo")
    .setDescription("Lista todas las tareas pendientes"),
  new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Muestra tus tareas pendientes"),
].map((command) => command.toJSON());

const token = process.env.DISCORD_TOKEN!;
const clientId = "1433136085579600076";
const guildId = "1432062710585098253";

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    console.log("Registrando comandos...");
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands,
    });
    console.log("✓ Comandos registrados: /todo, /stats");
  } catch (error) {
    console.error("Error:", error);
  }
})();
