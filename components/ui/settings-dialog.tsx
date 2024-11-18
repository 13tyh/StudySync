"use client";

import {useState} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {Settings2} from "lucide-react";
import {useToast} from "@/hooks/use-toast";
import {useStudyStore} from "@/hooks/useStudyStore";
import {supabase} from "@/lib/supabaseClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function SettingsDialog() {
  const {toast} = useToast();
  const {
    dailyGoal,
    weeklyGoal,
    dailyTodo,
    setDailyGoal,
    setWeeklyGoal,
    setDailyTodo,
  } = useStudyStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    dailyGoal: Math.round(dailyGoal / 60),
    weeklyGoal: Math.round(weeklyGoal / 60),
    dailyTodo: dailyTodo || "",
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const {data: user} = await supabase.auth.getUser();

      if (!user.user) {
        // デモユーザーとして保存
        setDailyGoal(formData.dailyGoal * 60);
        setWeeklyGoal(formData.weeklyGoal * 60);
        setDailyTodo(formData.dailyTodo);

        toast({
          title: "設定を保存しました",
          description: "デモモードでの変更は一時的なものです",
        });

        setIsOpen(false);
        return;
      }

      const {error} = await supabase.from("goals").upsert({
        user_id: user.user.id,
        daily_goal: formData.dailyGoal * 60,
        weekly_goal: formData.weeklyGoal * 60,
        daily_todo: formData.dailyTodo,
      });

      if (error) throw error;

      setDailyGoal(formData.dailyGoal * 60);
      setWeeklyGoal(formData.weeklyGoal * 60);
      setDailyTodo(formData.dailyTodo);

      toast({
        title: "設定を保存しました",
        description: "目標が更新されました",
      });

      setIsOpen(false);
    } catch (error) {
      console.error("Error saving goals:", error);
      toast({
        title: "エラー",
        description: "設定の保存に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Settings2 className="h-5 w-5" />
          <span className="sr-only">設定</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>学習目標の設定</DialogTitle>
          <DialogDescription>
            1日と週間の学習目標を設定してください
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="dailyGoal">1日の目標時間（時間）</Label>
            <Input
              id="dailyGoal"
              type="number"
              min="0"
              step="0.5"
              value={formData.dailyGoal}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  dailyGoal: parseFloat(e.target.value),
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weeklyGoal">週間の目標時間（時間）</Label>
            <Input
              id="weeklyGoal"
              type="number"
              min="0"
              step="0.5"
              value={formData.weeklyGoal}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  weeklyGoal: parseFloat(e.target.value),
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dailyTodo">今日の目標</Label>
            <Textarea
              id="dailyTodo"
              value={formData.dailyTodo}
              onChange={(e) =>
                setFormData({...formData, dailyTodo: e.target.value})
              }
              placeholder="今日の学習目標を入力..."
            />
          </div>
          <Button onClick={handleSave} className="w-full" disabled={isLoading}>
            {isLoading ? "保存中..." : "保存"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
