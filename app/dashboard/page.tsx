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
import {signOut} from "next-auth/react";
import {LogOut} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {Button} from "@/components/ui/button";
import {toast} from "@/components/ui/use-toast";
import {useRouter} from "next/navigation";
import {supabase} from "@/lib/supabaseClient";
import useStudyStore from "@/hooks/useStudyStore";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const {theme} = useTheme();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = async () => {
    try {
      // セッションの取得確認
      const {
        data: {session},
      } = await supabase.auth.getSession();

      if (!session) {
        // すでにログアウト状態
        router.push("/login");
        return;
      }

      // Supabaseのログアウト処理
      const {error} = await supabase.auth.signOut();
      if (error) throw error;

      // ストアのリセット
      useStudyStore.getState().reset();

      // セッションストレージとローカルストレージのクリア
      sessionStorage.clear();
      localStorage.clear();

      // 遷移（強制リロード）
      window.location.href = "/login";

      toast({
        title: "ログアウト完了",
        description: "ログアウトしました",
      });
    } catch (error) {
      console.error("ログアウトエラー:", error);
      toast({
        title: "エラー",
        description: "ログアウトに失敗しました",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <TooltipProvider>
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
            <div className="flex items-center gap-2 sm:gap-4">
              <ThemeToggle />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={() => setShowLogoutDialog(true)}
                    className="p-2 sm:p-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline-block ml-2">
                      ログアウト
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="sm:hidden">
                  ログアウト
                </TooltipContent>
              </Tooltip>
            </div>
          </header>

          <Tabs defaultValue="dashboard" className="space-y-8">
            <TabsList className="inline-flex h-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-1 rounded-2xl border border-indigo-100/50 dark:border-white/10 shadow-lg">
              <TabsTrigger
                value="dashboard"
                className="rounded-xl px-6 py-2.5 xs:px-2 text-slate-700 dark:text-slate-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white font-medium transition-all"
              >
                ダッシュボード
              </TabsTrigger>
              <TabsTrigger
                value="timer"
                className="rounded-xl px-6 py-2.5 xs:px-2 text-slate-700 dark:text-slate-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white font-medium transition-all"
              >
                タイマー
              </TabsTrigger>
              <TabsTrigger
                value="calendar"
                className="rounded-xl px-6 py-2.5 xs:px-2 text-slate-700 dark:text-slate-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white font-medium transition-all"
              >
                カレンダー
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="rounded-xl px-6 py-2.5 xs:px-2 text-slate-700 dark:text-slate-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white font-medium transition-all"
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
        <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <AlertDialogContent className="bg-gradient-to-br from-white/95 to-white/75 dark:from-gray-800/95 dark:to-gray-900/75 backdrop-blur-lg border border-white/20 dark:border-white/10 shadow-xl">
            <AlertDialogHeader>
              <motion.div
                initial={{opacity: 0, y: -10}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.3}}
              >
                <AlertDialogTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <LogOut className="h-5 w-5 text-red-500" />
                  ログアウトの確認
                </AlertDialogTitle>
                <AlertDialogDescription className="mt-3 text-gray-600 dark:text-gray-300">
                  ログアウトすると、次回ログインが必要になります。
                  <br />
                  続行してもよろしいですか？
                </AlertDialogDescription>
              </motion.div>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3">
              <AlertDialogCancel className="rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                キャンセル
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                ログアウト
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
