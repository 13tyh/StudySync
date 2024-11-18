"use client";

import {useState} from "react";
import {format} from "date-fns";
import {ja} from "date-fns/locale";
import {Calendar} from "@/components/ui/calendar";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {useStudyStore} from "@/hooks/useStudyStore";
import {CalendarDays, Clock} from "lucide-react";
import {motion} from "framer-motion";

export default function StudyCalendar() {
  const {sessions} = useStudyStore();
  console.log(sessions);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  const getDayContent = (date: Date) => {
    const dayStudy = sessions.filter(
      (session) =>
        format(new Date(session.date), "yyyy-MM-dd") ===
        format(date, "yyyy-MM-dd")
    );

    const totalMinutes = dayStudy.reduce(
      (acc, session) => acc + session.duration,
      0
    );

    if (totalMinutes > 0) {
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="absolute inset-0 bg-indigo-100 dark:bg-indigo-900/30 rounded-full" />
          <span className="relative text-sm font-medium text-indigo-900 dark:text-indigo-100">
            {date.getDate()}
          </span>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
        </div>
      );
    }

    return (
      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
        {date.getDate()}
      </span>
    );
  };

  const selectedDateSessions = selectedDate
    ? sessions.filter(
        (session) =>
          format(new Date(session.date), "yyyy-MM-dd") ===
          format(selectedDate, "yyyy-MM-dd")
      )
    : [];

  const totalMinutesForSelectedDate = selectedDateSessions.reduce(
    (acc, session) => acc + session.duration,
    0
  );

  return (
    <motion.div
      initial={{opacity: 0, y: 20}}
      animate={{opacity: 1, y: 0}}
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-indigo-500" />
            学習カレンダー
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            locale={ja}
            className="rounded-lg border-none [&_.rdp-day]:h-10 [&_.rdp-day_button]:h-10 [&_.rdp-day_button]:w-10 [&_.rdp-day_button]:font-medium [&_.rdp-day_button]:text-gray-900 dark:[&_.rdp-day_button]:text-gray-100 [&_.rdp-day_button:hover]:bg-indigo-50 dark:[&_.rdp-day_button:hover]:bg-indigo-950"
            components={{
              DayContent: ({date}) => getDayContent(date),
            }}
          />
        </CardContent>
      </Card>

      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-500" />
            {selectedDate && format(selectedDate, "M月d日(E)", {locale: ja})}
            の記録
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDateSessions.length > 0 ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/30">
                <p className="text-lg font-semibold text-indigo-900 dark:text-indigo-100">
                  合計学習時間:{" "}
                  {Math.round((totalMinutesForSelectedDate / 60) * 10) / 10}時間
                </p>
              </div>
              <div className="space-y-2">
                {selectedDateSessions.map((session, index) => (
                  <motion.div
                    key={session.id}
                    initial={{opacity: 0, x: -20}}
                    animate={{opacity: 1, x: 0}}
                    transition={{delay: index * 0.1}}
                    className="p-3 rounded-lg border bg-white/50 dark:bg-gray-800/50"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{session.subject}</span>
                      <span className="text-sm text-muted-foreground">
                        {session.duration}分
                      </span>
                    </div>
                    {session.note && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {session.note}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              この日の学習記録はありません
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
