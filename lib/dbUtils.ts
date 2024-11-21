import {supabase} from "@/lib/supabaseClient";
import {Database} from "@/types/database";

export async function getUser() {
  const {
    data: {user},
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("認証されていないユーザーです");
  return user;
}

export async function fetchGoals(userId: string) {
  const {data, error} = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle(); // 修正：.single() → .maybeSingle()

  if (error) throw error;

  if (!data) {
    // データがない場合、初期目標を作成
    const {data: newGoals, error: insertError} = await supabase
      .from("goals")
      .insert({
        user_id: userId,
        daily_goal: 120, // カラム名を確認
        weekly_goal: 840, // カラム名を確認
        daily_todo: "",
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return newGoals;
  }

  return data;
}

export async function insertStudySession(
  session: Database["public"]["Tables"]["study_sessions"]["Insert"]
) {
  const {data, error} = await supabase.from("study_sessions").insert(session);
  if (error) throw error;
  return data;
}

export async function fetchStudySessions(userId: string) {
  const {data, error} = await supabase
    .from("study_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("date", {ascending: false});

  if (error) throw error;
  return data;
}

export async function deleteStudySession(sessionId: string, userId: string) {
  const {error} = await supabase
    .from("study_sessions")
    .delete()
    .eq("id", sessionId)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function updateStudySession(
  sessionId: string,
  updates: Partial<Database["public"]["Tables"]["study_sessions"]["Update"]>
) {
  const {error} = await supabase
    .from("study_sessions")
    .update(updates)
    .eq("id", sessionId);

  if (error) throw error;
}
