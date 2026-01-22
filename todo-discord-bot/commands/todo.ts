import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { formatDate, isOverdue, type TodoWithUser } from "@jomavicuna/todo-shared";
import { getUpcomingTodos } from "../lib/supabase";

function formatTodos(todos: TodoWithUser[]): string {
  return todos
    .map((todo, index) => {
      const emoji = isOverdue(todo.due_date!) ? "🔴" : "📌";
      const date = formatDate(todo.due_date!);
      return `${emoji} ${index + 1}. ${todo.title}\n   └ ${date}`;
    })
    .join("\n");
}

export async function handleTodoCommand(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  await interaction.deferReply();

  const todos = await getUpcomingTodos(20);

  if (todos.length === 0) {
    await interaction.editReply("📭 No hay tareas pendientes con fecha.");
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle("📋 Tareas pendientes")
    .setDescription(formatTodos(todos))
    .setColor(0x5865f2)
    .setFooter({ text: `${todos.length} tareas` })
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}
