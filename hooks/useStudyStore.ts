"use client";

import {create} from "zustand";
import {persist} from "zustand/middleware";
import {format} from "date-fns";

interface StudySession {
  id: string;
  date: Date;
  subject: string;
  duration: number;
  note?: string;
}

interface CustomCategory {
  id: string;
  name: string;
  color: string;
}

interface StudyStore {
  isStudying: boolean;
  currentSubject: string;
  currentTimer: number;
  sessions: StudySession[];
  startTime: Date | null;
  totalStudyTime: number;
  todayStudyTime: number;
  streakDays: number;
  dailyGoal: number;
  weeklyGoal: number;
  motivation: number;
  customCategories: CustomCategory[];
  lastStudyDate: string | null;
  longestStreak: number;
  dailyTodo: string;
  setIsStudying: (isStudying: boolean) => void;
  setCurrentSubject: (subject: string) => void;
  setCurrentTimer: (timer: number) => void;
  addSession: (session: Omit<StudySession, "id">) => void;
  setStartTime: (date: Date | null) => void;
  updateTotalTime: (minutes: number) => void;
  updateTodayTime: (minutes: number) => void;
  resetTodayTime: () => void;
  setDailyGoal: (minutes: number) => void;
  setWeeklyGoal: (minutes: number) => void;
  updateMotivation: (value: number) => void;
  addCustomCategory: (category: Omit<CustomCategory, "id">) => void;
  updateStreak: () => void;
  setDailyTodo: (todo: string) => void;
}

type StudyState = {
  sessions: StudySession[];
  streakDays: number;
  longestStreak: number;
  lastStudyDate: string;
  // 他のプロパティ
};

export const useStudyStore = create<StudyStore>()(
  persist(
    (set, get) => ({
      isStudying: false,
      currentSubject: "",
      currentTimer: 25 * 60,
      sessions: [],
      startTime: null,
      totalStudyTime: 0,
      todayStudyTime: 0,
      streakDays: 0,
      longestStreak: 0,
      dailyGoal: 120, // 2時間
      weeklyGoal: 840, // 14時間
      motivation: 80,
      customCategories: [],
      lastStudyDate: null,
      dailyTodo: "",
      setIsStudying: (isStudying) => set({isStudying}),
      setCurrentSubject: (subject) => set({currentSubject: subject}),
      setCurrentTimer: (timer) => set({currentTimer: timer}),
      addSession: (session) => {
        const today = format(new Date(), "yyyy-MM-dd");
        set((state) => {
          const newState = {
            sessions: [
              ...state.sessions,
              {...session, id: crypto.randomUUID()},
            ],
            streakDays: state.streakDays,
            longestStreak: state.longestStreak,
            lastStudyDate: state.lastStudyDate,
          };

          if (state.lastStudyDate !== today) {
            const yesterday = format(
              new Date(Date.now() - 86400000),
              "yyyy-MM-dd"
            );
            if (state.lastStudyDate === yesterday) {
              newState.streakDays = state.streakDays + 1;
              newState.longestStreak = Math.max(
                state.longestStreak,
                newState.streakDays
              );
            } else {
              newState.streakDays = 1;
            }
            newState.lastStudyDate = today;
          }

          return newState;
        });
      },
      setStartTime: (date) => set({startTime: date}),
      updateTotalTime: (minutes) =>
        set((state) => ({
          totalStudyTime: state.totalStudyTime + minutes,
        })),
      updateTodayTime: (minutes) =>
        set((state) => ({
          todayStudyTime: state.todayStudyTime + minutes,
        })),
      resetTodayTime: () => set({todayStudyTime: 0}),
      setDailyGoal: (minutes) => set({dailyGoal: minutes}),
      setWeeklyGoal: (minutes) => set({weeklyGoal: minutes}),
      updateMotivation: (value) =>
        set((state) => ({
          motivation: Math.min(100, Math.max(0, state.motivation + value)),
        })),
      addCustomCategory: (category) =>
        set((state) => ({
          customCategories: [
            ...state.customCategories,
            {...category, id: crypto.randomUUID()},
          ],
        })),
      updateStreak: () => {
        const today = format(new Date(), "yyyy-MM-dd");
        set((state) => {
          if (state.lastStudyDate !== today) {
            const yesterday = format(
              new Date(Date.now() - 86400000),
              "yyyy-MM-dd"
            );
            if (state.lastStudyDate === yesterday) {
              return {
                streakDays: state.streakDays + 1,
                longestStreak: Math.max(
                  state.longestStreak,
                  state.streakDays + 1
                ),
                lastStudyDate: today,
              };
            }
            return {streakDays: 1, lastStudyDate: today};
          }
          return {};
        });
      },
      setDailyTodo: (todo) => set({dailyTodo: todo}),
    }),
    {
      name: "study-store",
      onRehydrateStorage: () => (state) => {
        const today = format(new Date(), "yyyy-MM-dd");
        const lastDate = state?.lastStudyDate;

        if (lastDate !== today) {
          state?.resetTodayTime();
        }
      },
    }
  )
);
