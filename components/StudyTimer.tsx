"use client";

import {useState, useEffect, useCallback} from "react";
import {Play, Pause, RotateCcw, Volume2, VolumeX} from "lucide-react";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Textarea} from "@/components/ui/textarea";
import {useToast} from "@/hooks/use-toast";
import {cn} from "@/lib/utils";
import {useStudyStore} from "@/hooks/useStudyStore";
import {Progress} from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const SUBJECTS = [
  {value: "業務", label: "業務"},
  {value: "スキルの勉強", label: "スキル開発"},
  {value: "語学の勉強", label: "語学"},
  {value: "資格の勉強", label: "資格"},
  {value: "課題", label: "課題"},
  {value: "その他", label: "その他"},
] as const;

const INITIAL_TIME = 25 * 60;

export default function StudyTimer() {
  const {
    isStudying,
    currentSubject,
    currentTimer,
    setIsStudying,
    setCurrentSubject,
    setCurrentTimer,
    resetTimer,
    addSession,
    setStartTime,
    updateTotalTime,
    updateTodayTime,
    updateMotivation,
  } = useStudyStore();
  const {toast} = useToast();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [note, setNote] = useState("");
  const [sound, setSound] = useState(true);
  const [showNoteDialog, setShowNoteDialog] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;

    if (isStudying && currentTimer > 0) {
      timer = setInterval(() => {
        setCurrentTimer(currentTimer - 1);
        if (currentTimer <= 1) {
          if (sound) {
            const audio = new Audio("/notification.mp3");
            audio.play().catch(console.error);
          }
          handleComplete();
        }
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isStudying, currentTimer, sound]);

  const handleSaveNote = async () => {
    try {
      await addSession({
        date: new Date(),
        subject: currentSubject!,
        duration: Math.floor(elapsedTime / 60),
        note: note.trim(), // トリム処理を追加
      });

      updateTotalTime(Math.floor(elapsedTime / 60));
      updateTodayTime(Math.floor(elapsedTime / 60));

      toast({
        title: "保存完了",
        description: "学習記録を保存しました",
      });

      // 状態をリセット
      resetTimer();
      setElapsedTime(0);
      setNote("");
      setShowNoteDialog(false);
    } catch (error) {
      console.error("学習記録の保存に失敗:", error);
      toast({
        title: "エラー",
        description: "学習記録の保存に失敗しました",
        variant: "destructive",
      });
    }
  };

  const handleComplete = useCallback(async () => {
    if (!currentSubject) return;

    try {
      const duration = Math.floor(elapsedTime / 60);
      if (duration < 1) {
        toast({
          title: "警告",
          description: "1分未満の学習は記録されません",
          variant: "destructive",
        });
        return;
      }

      setIsStudying(false);
      setShowNoteDialog(true);

      const achievementRate = (duration / (INITIAL_TIME / 60)) * 100;
      updateMotivation(achievementRate > 80 ? 5 : achievementRate > 50 ? 3 : 1);
    } catch (error) {
      console.error("セッション完了処理エラー:", error);
      toast({
        title: "エラー",
        description: "処理に失敗しました",
        variant: "destructive",
      });
    }
  }, [currentSubject, elapsedTime]);

  const toggleTimer = () => {
    try {
      if (!currentSubject) {
        toast({
          title: "エラー",
          description: "カテゴリーを選択してください",
          variant: "destructive",
        });
        return;
      }

      if (!isStudying) {
        setStartTime(new Date());
        setIsStudying(true);
      } else {
        handleComplete();
      }
    } catch (error) {
      console.error("タイマー操作エラー:", error);
      toast({
        title: "エラー",
        description: "タイマーの操作に失敗しました",
        variant: "destructive",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const progress = ((INITIAL_TIME - currentTimer) / INITIAL_TIME) * 100;

  return (
    <>
      <Card className="p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-lg">
        <div className="flex flex-col items-center gap-8">
          <div className="flex items-center gap-4">
            <Select
              value={currentSubject ?? undefined}
              onValueChange={setCurrentSubject}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="カテゴリーを選択" />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map(({value, label}) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSound(!sound)}
              className="rounded-full"
            >
              {sound ? (
                <Volume2 className="h-5 w-5" />
              ) : (
                <VolumeX className="h-5 w-5" />
              )}
            </Button>
          </div>

          <div className="w-full max-w-md space-y-4">
            <div
              className={cn(
                "text-7xl font-bold font-mono text-center",
                currentTimer <= 60
                  ? "text-red-500"
                  : currentTimer <= 180
                  ? "text-amber-500"
                  : "text-indigo-500"
              )}
            >
              {formatTime(currentTimer)}
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="flex gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={resetTimer}
              className="rounded-full h-12 w-12"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
            <Button
              onClick={toggleTimer}
              size="icon"
              className={cn(
                "rounded-full h-12 w-12",
                isStudying
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-indigo-500 hover:bg-indigo-600"
              )}
            >
              {isStudying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </Card>

      <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>学習メモを記録</DialogTitle>
            <DialogDescription>
              今回の学習内容を簡単にメモしておきましょう
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="学習内容をメモ..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowNoteDialog(false)}
              >
                キャンセル
              </Button>
              <Button onClick={handleSaveNote}>保存</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
