import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { getUpcomingTodos, type TodoWithUser } from "../lib/supabase";

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("es-PE", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function isOverdue(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(dateStr + "T00:00:00");
  return dueDate < today;
}

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
