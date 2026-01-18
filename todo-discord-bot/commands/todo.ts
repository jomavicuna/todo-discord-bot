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

function groupByUser(todos: TodoWithUser[]): Map<string, TodoWithUser[]> {
  const groups = new Map<string, TodoWithUser[]>();

  for (const todo of todos) {
    const userName = todo.user?.full_name ?? "Sin asignar";
    const existing = groups.get(userName) ?? [];
    existing.push(todo);
    groups.set(userName, existing);
  }

  return groups;
}

function formatGroupedTodos(todos: TodoWithUser[]): string {
  const grouped = groupByUser(todos);
  const lines: string[] = [];

  // Sort: named users first, "Sin asignar" last
  const sortedGroups = [...grouped.entries()].sort(([a], [b]) => {
    if (a === "Sin asignar") return 1;
    if (b === "Sin asignar") return -1;
    return a.localeCompare(b);
  });

  for (const [userName, userTodos] of sortedGroups) {
    const icon = userName === "Sin asignar" ? "📭" : "👤";
    lines.push(`${icon} **${userName}**`);

    userTodos.forEach((todo, index) => {
      const emoji = isOverdue(todo.due_date!) ? "🔴" : "📌";
      const date = formatDate(todo.due_date!);
      lines.push(`   ${emoji} ${index + 1}. ${todo.title}`);
      lines.push(`      └ ${date}`);
    });

    lines.push(""); // Empty line between groups
  }

  return lines.join("\n").trim();
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
    .setDescription(formatGroupedTodos(todos))
    .setColor(0x5865f2)
    .setFooter({ text: `${todos.length} tareas` })
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}
