"use client";

import {useState} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
// import {Settings2} from "lucide-react";
import {useToast} from "@/hooks/use-toast";
import {useStudyStore} from "@/hooks/useStudyStore";
import {supabase} from "@/lib/supabaseClient";
import {
  Dialog,
  DialogContent,
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
      const {
        data: {user},
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "エラー",
          description: "ユーザーが認証されていません",
          variant: "destructive",
        });
        return;
      }

      // 既存の目標を取得
      const {data: existingGoals, error: fetchError} = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }

      // 目標を新規作成または更新
      const {error: upsertError} = await supabase.from("goals").upsert({
        user_id: user.id,
        daily_goal: formData.dailyGoal * 60,
        weekly_goal: formData.weeklyGoal * 60,
        daily_todo: formData.dailyTodo,
        id: existingGoals ? existingGoals.id : undefined, // 既存の目標があればIDを設定
      });

      if (upsertError) throw upsertError;

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
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">目標を設定</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>目標を設定</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
              <Label htmlFor="weeklyGoal">1週間の目標時間（時間）</Label>
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
              />
            </div>
            <Button onClick={handleSave} disabled={isLoading}>
              保存
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
