"use client";

import {useState, useEffect} from "react";
import {format} from "date-fns";
import {ja} from "date-fns/locale";
import {Trash2, Edit3, Clock, BookOpen} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {useToast} from "@/hooks/use-toast";
import {Badge} from "@/components/ui/badge";
import {motion, AnimatePresence} from "framer-motion";
import {supabase} from "@/lib/supabaseClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Label} from "@/components/ui/label";
import {SUBJECTS} from "./StudyTimer";

interface StudySession {
  id: string;
  subject: string;
  duration: number;
  note?: string;
  date: string;
}

export default function StudyHistory() {
  const {toast} = useToast();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [editingSession, setEditingSession] = useState<StudySession | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      const {data, error} = await supabase
        .from("study_sessions")
        .select("*")
        .order("date", {ascending: false});

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      toast({
        title: "エラー",
        description: "学習記録の取得に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("この記録を削除してもよろしいですか？")) return;

    try {
      const {error} = await supabase
        .from("study_sessions")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "削除完了",
        description: "学習記録を削除しました。",
      });

      fetchSessions();
    } catch (error) {
      console.error("Error deleting session:", error);
      toast({
        title: "エラー",
        description: "削除に失敗しました。",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async () => {
    if (!editingSession) return;

    try {
      const {error} = await supabase
        .from("study_sessions")
        .update({
          duration: editingSession.duration,
          note: editingSession.note,
        })
        .eq("id", editingSession.id);

      if (error) throw error;

      toast({
        title: "更新完了",
        description: "学習記録を更新しました。",
      });

      setIsDialogOpen(false);
      fetchSessions();
    } catch (error) {
      console.error("Error updating session:", error);
      toast({
        title: "エラー",
        description: "更新に失敗しました。",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-gradient-to-br from-white/80 to-white/60 dark:from-gray-800/90 dark:to-gray-900/80 backdrop-blur-lg shadow-xl border-white/20 dark:border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-indigo-500" />
          学習履歴
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
          </div>
        ) : (
          <AnimatePresence>
            <motion.div layout className="space-y-4">
              {sessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{opacity: 0, y: 20}}
                  animate={{opacity: 1, y: 0}}
                  exit={{opacity: 0, scale: 0.95}}
                  transition={{delay: index * 0.05}}
                  className="group relative p-4 rounded-xl border border-white/40 dark:border-white/10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white/60 dark:hover:bg-gray-800/60 transition-all shadow-lg hover:shadow-xl"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="secondary"
                          className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300"
                        >
                          {
                            SUBJECTS.find((s) => s.value === session.subject)
                              ?.label
                          }
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                          <Clock className="h-4 w-4" />
                          {format(new Date(session.date), "M月d日(E) HH:mm", {
                            locale: ja,
                          })}
                        </div>
                      </div>
                      {session.note && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                          {session.note}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant="outline"
                          className="bg-indigo-50 dark:bg-indigo-900/30"
                        >
                          {session.duration}分
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingSession(session);
                          setIsDialogOpen(true);
                        }}
                        className="h-8 w-8"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(session.id)}
                        className="h-8 w-8 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
              {sessions.length === 0 && (
                <motion.div
                  initial={{opacity: 0}}
                  animate={{opacity: 1}}
                  className="text-center py-8 text-slate-500 dark:text-slate-400"
                >
                  学習記録がありません
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>学習記録の編集</DialogTitle>
          </DialogHeader>
          {editingSession && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>学習時間（分）</Label>
                <Input
                  type="number"
                  value={editingSession.duration}
                  onChange={(e) =>
                    setEditingSession({
                      ...editingSession,
                      duration: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>メモ</Label>
                <Textarea
                  value={editingSession.note || ""}
                  onChange={(e) =>
                    setEditingSession({
                      ...editingSession,
                      note: e.target.value,
                    })
                  }
                  className="min-h-[100px]"
                />
              </div>
              <Button onClick={handleUpdate} className="w-full">
                更新
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
