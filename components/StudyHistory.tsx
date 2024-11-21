"use client";

import {useState, useEffect} from "react";
import {BookOpen} from "lucide-react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {useToast} from "@/hooks/use-toast";
import {StudySession} from "@/types/StudySession";
import {supabase} from "@/lib/supabaseClient";
import {useRouter} from "next/navigation";

export default function StudyHistory() {
  const {toast} = useToast();
  const router = useRouter();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      // 直接Supabaseを使用してデータを取得
      const {
        data: {user},
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push("/login");
        return;
      }

      const {data, error} = await supabase
        .from("study_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {ascending: false});

      if (error) {
        throw error;
      }

      setSessions(data || []);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      toast({
        title: "エラー",
        description: "学習履歴の取得に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <Card className="bg-gradient-to-br from-white/80 to-white/60 dark:from-gray-800/90 dark:to-gray-900/80 backdrop-blur-lg shadow-xl border-white/20 dark:border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-indigo-500" />
          学習履歴
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-indigo-500 rounded-full border-t-transparent" />
          </div>
        ) : sessions.length > 0 ? (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="p-4 rounded-lg bg-white/50 dark:bg-gray-800/50"
              >
                <div className="flex justify-between items-center">
                  <div className="text-lg font-medium">{session.subject}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(session.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    学習時間: {session.duration}分
                  </span>
                </div>
                {session.note && (
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {session.note}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-4">
            学習記録がありません
          </div>
        )}
      </CardContent>
    </Card>
  );
}
