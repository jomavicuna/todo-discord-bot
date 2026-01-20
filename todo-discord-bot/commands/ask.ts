import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { supabase } from "../lib/supabase";

export async function handleAskCommand(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  await interaction.deferReply();

  const discordUserId = interaction.user.id;
  const question = interaction.options.getString("pregunta", true);

  try {
    const { data, error } = await supabase.functions.invoke("ask-ai", {
      body: { discord_user_id: discordUserId, question },
    });

    if (error) {
      console.error("Error calling ask-ai:", error);
      await interaction.editReply("❌ Error al consultar la IA. Intenta de nuevo.");
      return;
    }

    const response = data?.response || "No recibí respuesta de la IA.";

    // Truncate if too long for Discord (max 4096 for embed description)
    const truncatedResponse =
      response.length > 1900
        ? response.substring(0, 1900) + "..."
        : response;

    const embed = new EmbedBuilder()
      .setTitle("🤖 Respuesta de IA")
      .setDescription(truncatedResponse)
      .setColor(0x5865f2)
      .setFooter({ text: `Pregunta: ${question.substring(0, 100)}${question.length > 100 ? "..." : ""}` })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    console.error("Unexpected error in ask command:", err);
    await interaction.editReply("❌ Ocurrió un error inesperado. Intenta de nuevo.");
  }
}
