import { REST, Routes, SlashCommandBuilder } from "discord.js";

const GUILD_ID = "1432062710585098253";
const CLIENT_ID = "1433136085579600076";

const commands = [
  new SlashCommandBuilder()
    .setName("todo")
    .setDescription("Muestra las 10 tareas pendientes más próximas"),
].map((cmd) => cmd.toJSON());

const rest = new REST().setToken(process.env.DISCORD_TOKEN!);

async function register() {
  try {
    console.log("Registrando comando /todo...");

    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: commands,
    });

    console.log("Comando registrado exitosamente.");
  } catch (error) {
    console.error("Error registrando comando:", error);
  }
}

register();
