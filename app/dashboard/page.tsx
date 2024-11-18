"use client";

import {useState, useEffect} from "react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import StudyDashboard from "@/components/StudyDashboard";
import StudyTimer from "@/components/StudyTimer";
import StudyCalendar from "@/components/StudyCalendar";
import StudyHistory from "@/components/StudyHistory";
import {ThemeToggle} from "@/components/theme-toggle";
import LoadingScreen from "@/components/LoadingScreen";
import Background3D from "@/components/Background3D";
import {motion} from "framer-motion";
import {useTheme} from "next-themes";

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const {theme} = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div
      className={`min-h-screen bg-transparent ${
        theme === "dark" ? "text-white" : "text-slate-900"
      }`}
    >
      <Background3D />
      <motion.div
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        transition={{duration: 0.5}}
        className="relative container mx-auto px-4 py-8"
      >
        <header className="flex justify-between items-center mb-8">
          <div>
            <motion.h1
              initial={{opacity: 0, y: 20}}
              animate={{opacity: 1, y: 0}}
              className={`text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r ${
                theme === "dark"
                  ? "from-indigo-400 to-purple-400"
                  : "from-indigo-600 to-purple-600"
              }`}
            >
              StudySync
            </motion.h1>
            <motion.p
              initial={{opacity: 0, y: 20}}
              animate={{opacity: 1, y: 0}}
              transition={{delay: 0.1}}
              className={`font-medium ${
                theme === "dark" ? "text-gray-400" : "text-slate-600"
              }`}
            >
              学習の進捗を可視化
            </motion.p>
          </div>
          <ThemeToggle />
        </header>

        <Tabs defaultValue="dashboard" className="space-y-8">
          <TabsList className="inline-flex h-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-1 rounded-2xl border border-indigo-100/50 dark:border-white/10 shadow-lg">
            <TabsTrigger
              value="dashboard"
              className="rounded-xl px-6 py-2.5 text-slate-700 dark:text-slate-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white font-medium transition-all"
            >
              ダッシュボード
            </TabsTrigger>
            <TabsTrigger
              value="timer"
              className="rounded-xl px-6 py-2.5 text-slate-700 dark:text-slate-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white font-medium transition-all"
            >
              タイマー
            </TabsTrigger>
            <TabsTrigger
              value="calendar"
              className="rounded-xl px-6 py-2.5 text-slate-700 dark:text-slate-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white font-medium transition-all"
            >
              カレンダー
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="rounded-xl px-6 py-2.5 text-slate-700 dark:text-slate-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white font-medium transition-all"
            >
              履歴
            </TabsTrigger>
          </TabsList>

          <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: 0.2}}
            className="space-y-6"
          >
            <TabsContent value="dashboard" className="mt-0">
              <StudyDashboard />
            </TabsContent>

            <TabsContent value="timer" className="mt-0">
              <div className="max-w-xl mx-auto">
                <StudyTimer />
              </div>
            </TabsContent>

            <TabsContent value="calendar" className="mt-0">
              <StudyCalendar />
            </TabsContent>

            <TabsContent value="history" className="mt-0">
              <StudyHistory />
            </TabsContent>
          </motion.div>
        </Tabs>
      </motion.div>
    </div>
  );
}
