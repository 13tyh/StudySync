"use client";

import {useEffect, useState} from "react";
import {motion} from "framer-motion";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Progress} from "@/components/ui/progress";
import {Badge} from "@/components/ui/badge";
import {useToast} from "@/components/ui/use-toast";
import useStudyStore from "@/hooks/useStudyStore";
import {SUBJECTS} from "./StudyTimer";
import {SettingsDialog} from "./ui/settings-dialog";
import {supabase} from "@/lib/supabaseClient";
import type {StudySession} from "@/types/StudySession";
import {
  BookOpen,
  Target,
  Flame,
  Trophy,
  Clock,
  Calendar,
  TrendingUp,
  CheckCircle2,
  Edit3,
} from "lucide-react";

const containerAnimation = {
  hidden: {opacity: 0},
  show: {
    opacity: 1,
    transition: {staggerChildren: 0.1},
  },
};

const itemAnimation = {
  hidden: {opacity: 0, y: 20},
  show: {opacity: 1, y: 0},
};

export default function StudyDashboard() {
  const {toast} = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [userSessions, setUserSessions] = useState<StudySession[]>([]);
  const {
    todayStudyTime,
    totalStudyTime,
    dailyGoal,
    weeklyGoal,
    streakDays,
    longestStreak,
    motivation,
    dailyTodo,
    fetchGoals,
  } = useStudyStore();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);

        const {
          data: {user},
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          console.error("認証エラー:", authError);
          toast({
            title: "認証エラー",
            description: authError.message,
            variant: "destructive",
          });
          return;
        }

        if (!user) {
          console.log("ユーザーが見つかりません");
          // ログインページにリダイレクト
          window.location.href = "/login";
          return;
        }

        // ユーザーの目標を取得
        await fetchGoals();

        // ユーザーのセッションを取得
        const {data: sessions, error: sessionsError} = await supabase
          .from("study_sessions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", {ascending: false});

        if (sessionsError) {
          console.error("セッション取得エラー:", sessionsError);
          throw sessionsError;
        }

        setUserSessions(sessions || []);
      } catch (error) {
        console.error("データ取得エラー:", error);
        toast({
          title: "エラー",
          description: "データの取得に失敗しました。再度ログインしてください。",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const dailyProgress = (todayStudyTime / dailyGoal) * 100;
  const weeklyProgress = (totalStudyTime / weeklyGoal) * 100;

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  return (
    <motion.div
      variants={containerAnimation}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          学習の進捗
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div variants={itemAnimation}>
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                今日の学習時間
              </CardTitle>
              <Clock className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round((todayStudyTime / 60) * 10) / 10}時間
              </div>
              <Progress value={dailyProgress} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                目標: {dailyGoal / 60}時間中 {Math.round(dailyProgress)}%
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemAnimation}>
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                週間学習時間
              </CardTitle>
              <Calendar className="h-4 w-4 text-violet-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round((totalStudyTime / 60) * 10) / 10}時間
              </div>
              <Progress value={weeklyProgress} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                目標: {weeklyGoal / 60}時間中 {Math.round(weeklyProgress)}%
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemAnimation}>
          <Card className="bg-gradient-to-br from-white/95 to-white/75 dark:from-gray-800/95 dark:to-gray-900/75 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20 dark:border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500 animate-pulse" />
                <CardTitle className="text-base font-semibold">
                  継続日数
                </CardTitle>
              </div>
              <Badge
                variant="secondary"
                className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
              >
                {streakDays}日
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mt-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium">最長記録</span>
                </div>
                <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
                  {longestStreak}日
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemAnimation}>
          <Card className="bg-gradient-to-br from-white/95 to-white/75 dark:from-gray-800/95 dark:to-gray-900/75 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20 dark:border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                <CardTitle className="text-base font-semibold">
                  モチベーション
                </CardTitle>
              </div>
              <Badge
                variant="secondary"
                className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
              >
                {motivation}%
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={motivation} className="h-2.5" />
                <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                    継続的な学習でモチベーションアップ！
                  </p>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div variants={itemAnimation}>
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-indigo-500" />
                  今日の目標
                </CardTitle>
                <SettingsDialog />
              </div>
            </CardHeader>
            <CardContent>
              {dailyTodo ? (
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <p className="text-sm mt-1">{dailyTodo}</p>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-4">
                  <Edit3 className="h-4 w-4" />
                  <p>目標を設定して、今日の学習をより効果的に！</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemAnimation}>
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-500" />
                最近の学習記録
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center">
                    <div className="animate-spin h-8 w-8 border-4 border-indigo-500 rounded-full border-t-transparent" />
                  </div>
                ) : userSessions.length > 0 ? (
                  userSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-2 rounded-lg border bg-muted/50"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {
                              SUBJECTS.find((s) => s.value === session.subject)
                                ?.value
                            }
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(session.created_at).toLocaleDateString()}{" "}
                            -{" "}
                            {
                              SUBJECTS.find((s) => s.value === session.subject)
                                ?.label
                            }
                          </span>
                        </div>
                        {session.note && (
                          <p className="text-sm text-muted-foreground">
                            {session.note}
                          </p>
                        )}
                      </div>
                      <Badge>{session.duration}分</Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-sm text-muted-foreground py-4">
                    まだ学習記録がありません
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
