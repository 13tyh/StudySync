"use client";

import {format} from "date-fns";
import create from "zustand";
import {persist} from "zustand/middleware";
import {supabase} from "@/lib/supabaseClient";

interface StudySession {
  id: string;
  date: Date;
  subject: string;
  duration: number;
  note: string | null;
}

interface Goals {
  dailyGoal: number;
  weeklyGoal: number;
  dailyTodo: string;
}

const INITIAL_TIME = 25 * 60;

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

  // 基本機能
  setDailyGoal: (minutes: number) => void;
  setWeeklyGoal: (minutes: number) => void;
  setDailyTodo: (todo: string) => void;
  setGoals: (goals: Goals) => void;
  fetchGoals: () => Promise<void>;

  // タイマー関連
  setCurrentSubject: (subject: string | null) => void;
  setCurrentTimer: (seconds: number) => void;
  setStartTime: (time: Date | null) => void;
  setIsStudying: (isStudying: boolean) => void;
  resetTimer: () => void;

  // 学習記録関連
  updateTotalTime: (minutes: number) => void;
  updateTodayTime: (minutes: number) => void;
  resetTodayTime: () => void;
  updateMotivation: (value: number) => void;
  addSession: (session: Omit<StudySession, "id">) => Promise<void>;
  checkAndUpdateStreak: () => void;
}

export const useStudyStore = create<StudyStore>()(
  persist(
    (set, get) => ({
      // 基本状態
      dailyGoal: 0,
      weeklyGoal: 0,
      dailyTodo: "",
      todayStudyTime: 0,
      totalStudyTime: 0,
      streakDays: 0,
      longestStreak: 0,
      lastStudyDate: "",
      motivation: 100,
      sessions: [],

      // タイマー状態
      isStudying: false,
      currentSubject: null,
      currentTimer: INITIAL_TIME,
      startTime: null,

      setDailyGoal: (minutes) => {
        if (minutes < 0) throw new Error("目標時間は0以上である必要があります");
        set({dailyGoal: minutes});
      },
      setWeeklyGoal: (minutes) => {
        if (minutes < 0) throw new Error("目標時間は0以上である必要があります");
        set({weeklyGoal: minutes});
      },
      setDailyTodo: (todo) => {
        if (todo.length > 1000)
          throw new Error("目標は1000文字以内である必要があります");
        set({dailyTodo: todo.trim()});
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
          const {
            data: {user},
          } = await supabase.auth.getUser();
          if (!user) throw new Error("認証されていないユーザーです");

          const {data, error} = await supabase
            .from("goals")
            .select("*")
            .eq("user_id", user.id)
            .single();

          if (error) throw error;
          if (!data) throw new Error("目標が見つかりません");

          set({
            dailyGoal: data.daily_goal,
            weeklyGoal: data.weekly_goal,
            dailyTodo: data.daily_todo,
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
      resetTodayTime: () => set({todayStudyTime: 0}),
      updateMotivation: (value) =>
        set((state) => ({
          motivation: Math.min(100, Math.max(0, state.motivation + value)),
        })),

      setCurrentSubject: (subject) => set({currentSubject: subject}),
      setStartTime: (time) => set({startTime: time}),

      setCurrentTimer: (seconds) => {
        if (seconds < 0)
          throw new Error("タイマー値は0以上である必要があります");
        set({currentTimer: seconds});
      },

      addSession: async (sessionData) => {
        try {
          const {
            data: {user},
          } = await supabase.auth.getUser();
          if (!user) throw new Error("認証されていないユーザーです");

          // セッションデータの作成時にnoteをトリム
          const newSession = {
            id: crypto.randomUUID(),
            ...sessionData,
            date: new Date(sessionData.date),
            note: sessionData.note?.trim() || null, // null に変更
          };

          // Supabaseへの保存
          const {error} = await supabase.from("study_sessions").insert({
            user_id: user.id,
            subject: newSession.subject,
            duration: newSession.duration,
            note: newSession.note,
            created_at: newSession.date.toISOString(),
          });

          if (error) throw error;

          // ローカルステートの更新
          set((state) => {
            const updatedSessions = [newSession, ...state.sessions];
            return {
              sessions: updatedSessions.sort((a, b) => {
                const dateA =
                  a.date instanceof Date ? a.date : new Date(a.date);
                const dateB =
                  b.date instanceof Date ? b.date : new Date(b.date);
                return dateB.getTime() - dateA.getTime();
              }),
            };
          });

          get().checkAndUpdateStreak();
        } catch (error) {
          console.error("セッションの追加に失敗しました:", error);
          throw error;
        }
      },

      checkAndUpdateStreak: () => {
        set((state) => {
          const today = format(new Date(), "yyyy-MM-dd");
          const lastDate = state.lastStudyDate;

          let newStreak = state.streakDays;
          if (lastDate === today) {
            return state; // 同日の場合は更新しない
          }

          // 前日の場合はストリークを継続
          const yesterday = format(
            new Date(Date.now() - 24 * 60 * 60 * 1000),
            "yyyy-MM-dd"
          );

          if (lastDate === yesterday) {
            newStreak += 1;
          } else {
            newStreak = 1; // ストリークリセット
          }

          return {
            streakDays: newStreak,
            longestStreak: Math.max(state.longestStreak, newStreak),
            lastStudyDate: today,
          };
        });
      },

      setIsStudying: (studying: boolean) => {
        try {
          const state = get();
          // 学習開始時の検証
          if (studying && !state.currentSubject) {
            throw new Error("カテゴリーを選択してください");
          }

          set({
            isStudying: studying,
          });
        } catch (error) {
          console.error("学習状態の更新に失敗しました:", error);
          throw error;
        }
      },

      resetTimer: () => {
        set({
          isStudying: false,
          currentTimer: INITIAL_TIME,
        });
      },
    }),
    {
      name: "study-store",
      getStorage: () => localStorage,
      partialize: (state) => ({
        ...state,
        sessions: state.sessions.map((session) => ({
          ...session,
          // 永続化時の日付変換を安全に行う
          date:
            session.date instanceof Date
              ? session.date.toISOString()
              : typeof session.date === "string"
              ? session.date
              : new Date().toISOString(),
        })),
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // 再水和時の日付変換
          state.sessions = state.sessions.map((session) => ({
            ...session,
            date: new Date(session.date),
          }));
        }
      },
    }
  )
);
