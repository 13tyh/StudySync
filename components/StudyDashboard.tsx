"use client";

import {useEffect} from "react";
import {motion} from "framer-motion";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Progress} from "@/components/ui/progress";
import {Badge} from "@/components/ui/badge";
import {useStudyStore} from "@/hooks/useStudyStore";
import {SUBJECTS} from "./StudyTimer";
import {SettingsDialog} from "./ui/settings-dialog";
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
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemAnimation = {
  hidden: {opacity: 0, y: 20},
  show: {opacity: 1, y: 0},
};

export default function StudyDashboard() {
  const {
    todayStudyTime,
    totalStudyTime,
    dailyGoal,
    weeklyGoal,
    streakDays,
    longestStreak,
    motivation,
    sessions,
    dailyTodo,
  } = useStudyStore();

  const dailyProgress = (todayStudyTime / dailyGoal) * 100;
  const weeklyProgress = (totalStudyTime / weeklyGoal) * 100;

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
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">継続日数</CardTitle>
              <Flame className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{streakDays}日</div>
              <div className="flex items-center mt-2">
                <Trophy className="h-4 w-4 text-yellow-500 mr-2" />
                <span className="text-sm text-muted-foreground">
                  最長記録: {longestStreak}日
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemAnimation}>
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                モチベーション
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{motivation}%</div>
              <Progress value={motivation} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                継続的な学習でモチベーションアップ！
              </p>
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
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <p className="text-sm flex-grow mt-1">{dailyTodo}</p>
                  </div>
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
              <div className="space-y-2">
                {sessions
                  .slice(-3)
                  .reverse()
                  .map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-2 rounded-lg border bg-muted/50"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {
                              SUBJECTS.find((s) => s.value === session.subject)
                                ?.label
                            }
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(session.date).toLocaleDateString()}
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
                  ))}
                {sessions.length === 0 && (
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
