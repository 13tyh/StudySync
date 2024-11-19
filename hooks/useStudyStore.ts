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
  note?: string;
}

interface CustomCategory {
  id: string;
  user_id: string;
  name: string;
  color: string;
  description?: string;
  created_at: string;
}

interface Goals {
  dailyGoal: number;
  weeklyGoal: number;
  dailyTodo: string;
}

const MAX_CATEGORIES = 10;
const DEFAULT_COLOR = "#666666";

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
  customCategories: CustomCategory[];
  setDailyGoal: (minutes: number) => void;
  setWeeklyGoal: (minutes: number) => void;
  setDailyTodo: (todo: string) => void;
  setGoals: (goals: Goals) => void;
  fetchGoals: () => Promise<void>;
  updateTotalTime: (minutes: number) => void;
  updateTodayTime: (minutes: number) => void;
  resetTodayTime: () => void;
  updateMotivation: (value: number) => void;
  addCustomCategory: (
    category: Omit<CustomCategory, "id" | "created_at">
  ) => Promise<void>;
  fetchCustomCategories: () => Promise<void>;
  setCurrentSubject: (subject: string | null) => void;
}

export const useStudyStore = create<StudyStore>()(
  persist(
    (set, get) => ({
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
      isStudying: false,
      currentSubject: null,
      currentTimer: 0,
      startTime: null,
      customCategories: [],

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
      addCustomCategory: async (category) => {
        try {
          const {
            data: {user},
          } = await supabase.auth.getUser();
          if (!user) throw new Error("認証されていないユーザーです");

          const state = get();
          if (state.customCategories.length >= MAX_CATEGORIES) {
            throw new Error(`カテゴリーは最大${MAX_CATEGORIES}個までです`);
          }

          const newCategory = {
            ...category,
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
            user_id: user.id,
          };

          const {error} = await supabase
            .from("custom_categories")
            .insert(newCategory);

          if (error) throw error;

          set((state) => ({
            customCategories: [...state.customCategories, newCategory].sort(
              (a, b) => a.name.localeCompare(b.name, "ja")
            ),
          }));
        } catch (error) {
          console.error("カテゴリーの追加に失敗しました:", error);
          throw error;
        }
      },
      fetchCustomCategories: async () => {
        try {
          const {
            data: {user},
          } = await supabase.auth.getUser();
          if (!user) throw new Error("認証されていないユーザーです");

          const {data, error} = await supabase
            .from("custom_categories")
            .select("*")
            .eq("user_id", user.id)
            .order("name");

          if (error) throw error;
          set({customCategories: data || []});
        } catch (error) {
          console.error("カテゴリーの取得に失敗しました:", error);
          throw error;
        }
      },
      setCurrentSubject: (subject) => set({currentSubject: subject}),
    }),
    {
      name: "study-store",
      onRehydrateStorage: () => (state) => {
        state?.fetchCustomCategories();
      },
    }
  )
);
