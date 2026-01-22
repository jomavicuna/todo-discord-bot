import { createClient } from "@supabase/supabase-js";
import type { TodoWithUser, TodoThread } from "@jomavicuna/todo-shared";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Re-export types from shared package
export type { User, Todo, TodoWithUser, TodoThread } from "@jomavicuna/todo-shared";

export async function getUpcomingTodos(limit = 10): Promise<TodoWithUser[]> {
  const { data, error } = await supabase
    .from("todo")
    .select("id, title, due_date, description, is_completed, user:users(id, full_name)")
    .eq("is_completed", false)
    .not("due_date", "is", null)
    .order("due_date", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Error fetching todos:", error);
    return [];
  }

  return (data ?? []) as TodoWithUser[];
}

export async function getTodosByDiscordUser(
  discordUserId: string,
  limit = 15
): Promise<TodoWithUser[]> {
  const { data, error } = await supabase
    .from("todo")
    .select("id, title, due_date, description, is_completed, user:users!inner(id, full_name, discord_user_id)")
    .eq("user.discord_user_id", discordUserId)
    .eq("is_completed", false)
    .order("due_date", { ascending: true, nullsFirst: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching user todos:", error);
    return [];
  }

  return (data ?? []) as TodoWithUser[];
}

// ============================================
// Thread Tracking
// ============================================

// In-memory cache for tracked thread IDs
let trackedThreadIds: Set<string> = new Set();
let cacheLoadedAt: number = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function loadThreadCache(): Promise<void> {
  const { data, error } = await supabase
    .from("todo_threads")
    .select("discord_thread_id");

  if (error) {
    console.error("Error loading thread cache:", error);
    return;
  }

  trackedThreadIds = new Set(data?.map((t) => t.discord_thread_id) ?? []);
  cacheLoadedAt = Date.now();
  console.log(`Thread cache loaded: ${trackedThreadIds.size} threads`);
}

export function isThreadTracked(threadId: string): boolean {
  // Refresh cache if TTL expired
  if (Date.now() - cacheLoadedAt > CACHE_TTL_MS) {
    loadThreadCache(); // Fire and forget, use stale cache for this check
  }
  return trackedThreadIds.has(threadId);
}

export async function updateThreadActivity(threadId: string): Promise<void> {
  const { error } = await supabase
    .from("todo_threads")
    .update({ last_activity_at: new Date().toISOString() })
    .eq("discord_thread_id", threadId);

  if (error) {
    console.error("Error updating thread activity:", error);
  }
}
