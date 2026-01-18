import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { getTodosByDiscordUser, type TodoWithUser } from "../lib/supabase";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Sin fecha";
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("es-PE", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function isOverdue(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(dateStr + "T00:00:00");
  return dueDate < today;
}

function formatTodos(todos: TodoWithUser[]): string {
  return todos
    .map((todo, index) => {
      const emoji = isOverdue(todo.due_date) ? "🔴" : "📌";
      const date = formatDate(todo.due_date);
      return `${emoji} ${index + 1}. ${todo.title}\n   └ ${date}`;
    })
    .join("\n");
}

export async function handleStatsCommand(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  await interaction.deferReply();

  const discordUserId = interaction.user.id;
  const todos = await getTodosByDiscordUser(discordUserId, 15);

  if (todos.length === 0) {
    await interaction.editReply("📭 No tienes tareas pendientes.");
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle("📋 Tus tareas pendientes")
    .setDescription(formatTodos(todos))
    .setColor(0x5865f2)
    .setFooter({ text: `${todos.length} tarea${todos.length > 1 ? "s" : ""}` })
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}
