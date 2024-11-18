"use client";

import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Edit3 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useStudyStore } from '@/hooks/useStudyStore';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const SUBJECTS = [
  { value: 'work', label: '業務' },
  { value: 'skill', label: 'スキル開発' },
  { value: 'language', label: '語学' },
  { value: 'certification', label: '資格' },
  { value: 'other', label: 'その他' },
] as const;

const INITIAL_TIME = 25 * 60;

export default function StudyTimer() {
  const { toast } = useToast();
  const {
    isStudying,
    currentSubject,
    currentTimer,
    setIsStudying,
    setCurrentSubject,
    setCurrentTimer,
    addSession,
    setStartTime,
    updateTotalTime,
    updateTodayTime,
    updateMotivation
  } = useStudyStore();

  const [sound, setSound] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [note, setNote] = useState('');
  const [showNoteDialog, setShowNoteDialog] = useState(false);

  const playSound = useCallback(() => {
    if (sound) {
      const audio = new Audio('/notification.mp3');
      audio.play().catch(console.error);
    }
  }, [sound]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isStudying && currentTimer > 0) {
      interval = setInterval(() => {
        setCurrentTimer(currentTimer - 1);
        setElapsedTime(prev => prev + 1);
        if (currentTimer <= 1) {
          playSound();
          handleComplete();
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isStudying, currentTimer, playSound, setCurrentTimer]);

  const handleComplete = useCallback(() => {
    const duration = Math.floor(elapsedTime / 60);
    setIsStudying(false);
    setShowNoteDialog(true);
    
    // モチベーションを更新（目標達成度に応じて）
    const achievementRate = (duration / (INITIAL_TIME / 60)) * 100;
    updateMotivation(achievementRate > 80 ? 5 : achievementRate > 50 ? 3 : 1);

    addSession({
      date: new Date(),
      subject: currentSubject,
      duration: duration,
      note: note
    });
    
    updateTotalTime(duration);
    updateTodayTime(duration);
    
    toast({
      title: "セッション完了",
      description: `${SUBJECTS.find(s => s.value === currentSubject)?.label}の記録: ${duration}分`,
    });
    
    setCurrentTimer(INITIAL_TIME);
    setElapsedTime(0);
    setNote('');
  }, [currentSubject, setIsStudying, addSession, updateTotalTime, updateTodayTime, toast, setCurrentTimer, elapsedTime, note, updateMotivation]);

  const toggleTimer = () => {
    if (!currentSubject) {
      toast({
        title: "カテゴリーを選択してください",
        variant: "destructive",
      });
      return;
    }
    if (!isStudying) {
      setStartTime(new Date());
    } else {
      handleComplete();
    }
    setIsStudying(!isStudying);
  };

  const resetTimer = () => {
    if (isStudying) {
      const confirmed = window.confirm('タイマーをリセットしますか？');
      if (!confirmed) return;
    }
    setIsStudying(false);
    setCurrentTimer(INITIAL_TIME);
    setElapsedTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((INITIAL_TIME - currentTimer) / INITIAL_TIME) * 100;

  return (
    <>
      <Card className="p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-lg">
        <div className="flex flex-col items-center gap-8">
          <div className="flex items-center gap-4">
            <Select value={currentSubject} onValueChange={setCurrentSubject}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="カテゴリーを選択" />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSound(!sound)}
              className="rounded-full"
            >
              {sound ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </Button>
          </div>

          <div className="w-full max-w-md space-y-4">
            <div 
              className={cn(
                "text-7xl font-bold font-mono text-center",
                currentTimer <= 60 ? "text-red-500" :
                currentTimer <= 180 ? "text-amber-500" :
                "text-indigo-500"
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
                isStudying ? "bg-red-500 hover:bg-red-600" : "bg-indigo-500 hover:bg-indigo-600"
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
            <div className="flex justify-end">
              <Button onClick={() => setShowNoteDialog(false)}>
                保存
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}