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
    .single();

  if (error) throw error;
  if (!data) throw new Error("目標が見つかりません");

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
