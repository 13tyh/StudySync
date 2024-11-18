"use client";

import * as React from "react";
import {ChevronLeft, ChevronRight} from "lucide-react";
import {DayPicker} from "react-day-picker";
import {ja} from "date-fns/locale";
import {cn} from "@/lib/utils";
import {buttonVariants} from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      locale={ja}
      showOutsideDays={showOutsideDays}
      className={cn(
        "p-4 bg-white rounded-lg shadow-md dark:bg-gray-900", // 背景色調整
        className
      )}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-between items-center pt-1 relative",
        caption_label: "text-lg font-semibold text-gray-900 dark:text-gray-100",
        nav: "flex items-center space-x-2",
        nav_button: cn(
          buttonVariants({variant: "outline"}),
          "h-8 w-8 bg-transparent p-0 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
        ),
        nav_button_previous:
          "absolute right-12 top-1/2 transform -translate-y-1/2",
        nav_button_next: "absolute right-2 top-1/2 transform -translate-y-1/2",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-gray-500 rounded-md w-10 font-medium text-sm dark:text-gray-400",
        row: "flex w-full mt-2",
        cell: cn(
          "h-10 w-10 text-center text-sm p-0 relative",
          "[&:has([aria-selected].day-range-end)]:rounded-r-md",
          "[&:has([aria-selected].day-outside)]:bg-gray-100/50 dark:[&:has([aria-selected].day-outside)]:bg-gray-800/50",
          "[&:has([aria-selected])]:bg-gray-100 dark:[&:has([aria-selected])]:bg-gray-800",
          "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
          "focus-within:relative focus-within:z-20"
        ),
        day: cn(
          buttonVariants({variant: "ghost"}),
          "h-10 w-10 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_today: cn(
          "text-indigo-900 dark:text-indigo-100", // 今日の日付用文字色
          "[&:not([aria-selected])]:bg-blue-100 dark:[&:not([aria-selected])]:bg-blue-900/30" // 背景色をダークモード対応
        ),
        day_selected: cn(
          "text-blue-900 border border-violet-500", // ライトモード
          "dark:text-white dark:border-violet-500" // ダークモードでバイオレット系のボーダー
        ),
        day_outside: "text-gray-500 opacity-50 dark:text-gray-400", // 外の日付
        day_disabled: "text-gray-500 opacity-50 dark:text-gray-400", // 無効な日付
        day_range_middle: cn(
          "aria-selected:bg-gray-100 aria-selected:text-gray-900",
          "dark:aria-selected:bg-gray-800 dark:aria-selected:text-gray-50"
        ),
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({...props}) => (
          <ChevronLeft className="h-5 w-5 dark:text-gray-200" {...props} />
        ),
        IconRight: ({...props}) => (
          <ChevronRight className="h-5 w-5 dark:text-gray-200" {...props} />
        ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export {Calendar};
