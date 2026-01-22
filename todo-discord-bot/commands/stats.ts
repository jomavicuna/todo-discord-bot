import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { formatDate, isOverdue, type TodoWithUser } from "@jomavicuna/todo-shared";
import { getTodosByDiscordUser } from "../lib/supabase";

function formatTodos(todos: TodoWithUser[]): string {
  return todos
    .map((todo, index) => {
      const emoji = isOverdue(todo.due_date) ? "🔴" : "📌";
      const dueDate = formatDate(todo.due_date);

      // Build date line with work period if available
      let dateLine = "";
      if (todo.start_date && todo.end_date) {
        dateLine = `${formatDate(todo.start_date)} → ${formatDate(todo.end_date)} | vence ${dueDate}`;
      } else if (todo.start_date) {
        dateLine = `desde ${formatDate(todo.start_date)} | vence ${dueDate}`;
      } else {
        dateLine = dueDate;
      }

      return `${emoji} ${index + 1}. ${todo.title}\n   └ ${dateLine}`;
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
