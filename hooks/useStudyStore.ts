"use client";

import {create} from "zustand";
import {persist, createJSONStorage} from "zustand/middleware";
import {supabase} from "@/lib/supabaseClient";
import {format} from "date-fns";
import {
  getUser,
  fetchGoals,
  insertStudySession,
  fetchStudySessions,
  deleteStudySession,
  updateStudySession,
} from "@/lib/dbUtils";
import {toast} from "@/components/ui/use-toast";

interface StudySession {
  id: string;
  date: Date;
  subject: string;
  duration: number;
  note: string | null;
  user_id: string; // 必須に変更
  created_at?: string;
  updated_at?: string;
}

interface Goals {
  dailyGoal: number;
  weeklyGoal: number;
  dailyTodo: string;
}

const INITIAL_STATE = {
  dailyGoal: 0,
  weeklyGoal: 0,
  dailyTodo: "",
  todayStudyTime: 0,
  totalStudyTime: 0,
  streakDays: 0,
  longestStreak: 0,
  lastStudyDate: "",
  motivation: 100,
  sessions: [] as StudySession[],
  isStudying: false,
  currentSubject: null as string | null,
  currentTimer: 25 * 60,
  startTime: null as Date | null,
  currentUser: null as any,
};

interface StudyStore {
  dailyGoal: number;
  weeklyGoal: number;
  dailyTodo: string;
  todayStudyTime: number;
  totalStudyTime: number;
  streakDays: number;
  longestStreak: number;
  lastStudyDate: string;
  motivation: number;
  sessions: StudySession[];
  isStudying: boolean;
  currentSubject: string | null;
  currentTimer: number;
  startTime: Date | null;
  currentUser: any;

  setDailyGoal: (minutes: number) => void;
  setWeeklyGoal: (minutes: number) => void;
  setDailyTodo: (todo: string) => void;
  setGoals: (goals: Goals) => void;
  fetchGoals: () => Promise<void>;
  setCurrentSubject: (subject: string | null) => void;
  setCurrentTimer: (seconds: number) => void;
  setStartTime: (time: Date | null) => void;
  setIsStudying: (isStudying: boolean) => void;
  resetTimer: () => void;
  updateTotalTime: (minutes: number) => void;
  updateTodayTime: (minutes: number) => void;
  resetTodayTime: () => void;
  updateMotivation: (value: number) => void;
  addSession: (session: Omit<StudySession, "id" | "user_id">) => Promise<void>;
  checkAndUpdateStreak: () => void;
  setCurrentUser: (user: any) => Promise<void>;
  fetchUserData: () => Promise<void>;
  reset: () => void;
  initialize: (userId: string) => Promise<void>;
  logout: () => void;
}

const useStudyStore = create<StudyStore>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      setDailyGoal: (minutes) => {
        if (minutes < 0) throw new Error("目標時間は0以上である必要があります");
        set({dailyGoal: minutes});
      },
      setWeeklyGoal: (minutes) => {
        if (minutes < 0) throw new Error("目標時間は0以上である必要があります");
        set({weeklyGoal: minutes});
      },
      setDailyTodo: (todo) => {
        if (todo.length > 0 && todo.length <= 1000) {
          set({dailyTodo: todo.trim()});
        } else {
          throw new Error("目標は1文字以上1000文字以内である必要があります");
        }
      },
      setGoals: (goals) => {
        if (goals.dailyGoal < 0 || goals.weeklyGoal < 0) {
          throw new Error("目標時間は0以上である必要があります");
        }
        set({
          dailyGoal: goals.dailyGoal,
          weeklyGoal: goals.weeklyGoal,
          dailyTodo: goals.dailyTodo.trim(),
        });
      },
      fetchGoals: async () => {
        try {
          const user = await getUser();
          const goals = await fetchGoals(user.id);
          set({
            dailyGoal: goals.daily_goal,
            weeklyGoal: goals.weekly_goal,
            dailyTodo: goals.daily_todo || "",
          });
        } catch (error) {
          console.error("目標の取得に失敗しました:", error);
          throw error;
        }
      },
      updateTotalTime: (minutes) => {
        if (minutes < 0) throw new Error("学習時間は0以上である必要があります");
        set((state) => ({
          totalStudyTime: state.totalStudyTime + minutes,
        }));
      },
      updateTodayTime: (minutes) => {
        if (minutes < 0) throw new Error("学習時間は0以上である必要があります");
        set((state) => ({
          todayStudyTime: state.todayStudyTime + minutes,
        }));
      },
      resetTodayTime: () => {
        set({todayStudyTime: 0});
      },
      updateMotivation: (value) => {
        set({motivation: value});
      },
      addSession: async (sessionData) => {
        try {
          const {
            data: {user},
          } = await supabase.auth.getUser();
          if (!user) throw new Error("認証が必要です");

          const newSession = {
            user_id: user.id,
            subject: sessionData.subject,
            duration: sessionData.duration,
            note: sessionData.note || null,
            date: sessionData.date.toISOString(), // 日付をISOStringに変換
          };

          const result = await insertStudySession(newSession);
          if (!result || result.length === 0)
            throw new Error("セッションの追加に失敗しました");

          set((state) => ({
            sessions: [
              {
                ...result[0],
                date: new Date(result[0].date),
              },
              ...state.sessions,
            ].sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            ),
          }));

          get().checkAndUpdateStreak();
        } catch (error) {
          console.error("セッション追加エラー:", error);
          toast({
            title: "エラー",
            description: "学習記録の保存に失敗しました",
            variant: "destructive",
          });
          throw error;
        }
      },
      checkAndUpdateStreak: () => {
        set((state) => {
          const today = format(new Date(), "yyyy-MM-dd");
          const lastDate = state.lastStudyDate;
          let newStreak = state.streakDays;
          if (lastDate === today) {
            return state;
          }
          const yesterday = format(
            new Date(Date.now() - 24 * 60 * 60 * 1000),
            "yyyy-MM-dd"
          );
          if (lastDate === yesterday) {
            newStreak += 1;
          } else {
            newStreak = 1;
          }
          return {
            streakDays: newStreak,
            longestStreak: Math.max(state.longestStreak, newStreak),
            lastStudyDate: today,
          };
        });
      },
      setIsStudying: (studying) => {
        const state = get();
        if (studying && !state.currentSubject) {
          throw new Error("カテゴリーを選択してください");
        }
        set({isStudying: studying});
      },
      setCurrentSubject: (subject) => {
        set({currentSubject: subject});
      },
      setCurrentTimer: (seconds) => {
        if (seconds < 0)
          throw new Error("タイマー値は0以上である必要があります");
        set({currentTimer: seconds});
      },
      setStartTime: (time) => {
        set({startTime: time});
      },
      resetTimer: () => {
        set({
          isStudying: false,
          currentTimer: 25 * 60,
        });
      },
      setCurrentUser: async (user) => {
        set({currentUser: user});
      },
      fetchUserData: async () => {
        try {
          const {
            data: {user},
          } = await supabase.auth.getUser();
          if (!user) throw new Error("認証が必要です");

          set({currentUser: user});
          await get().fetchGoals();
          // 他の必要なデータ取得
        } catch (error) {
          console.error("ユーザーデータの取得に失敗:", error);
          throw error;
        }
      },
      reset: () => {
        set(INITIAL_STATE);
      },
      initialize: async (userId: string) => {
        try {
          set({currentUser: userId});
          await get().fetchUserData();
        } catch (error) {
          console.error("初期化エラー:", error);
          throw error;
        }
      },
      logout: () => {
        get().reset();
        localStorage.removeItem("study-storage");
      },
    }),
    {
      name: "study-storage",
      storage: createJSONStorage(() => sessionStorage), // localStorage から sessionStorage に変更
      partialize: (state) => ({
        // 永続化するステートを制限
        dailyGoal: state.dailyGoal,
        weeklyGoal: state.weeklyGoal,
        dailyTodo: state.dailyTodo,
        streakDays: state.streakDays,
        longestStreak: state.longestStreak,
        lastStudyDate: state.lastStudyDate,
      }),
    }
  )
);

export default useStudyStore;
