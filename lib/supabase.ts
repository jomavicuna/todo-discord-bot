import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface Todo {
  id: string;
  title: string;
  due_date: string | null;
  description: string | null;
  is_completed: boolean;
}

export async function getUpcomingTodos(limit = 10): Promise<Todo[]> {
  const { data, error } = await supabase
    .from("todo")
    .select("id, title, due_date, description, is_completed")
    .eq("is_completed", false)
    .not("due_date", "is", null)
    .order("due_date", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Error fetching todos:", error);
    return [];
  }

  return data ?? [];
}
