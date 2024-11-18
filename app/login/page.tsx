"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {motion} from "framer-motion";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {useToast} from "@/hooks/use-toast";
import {BookOpen, Mail, Lock, Loader2} from "lucide-react";
import {supabase} from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const {toast} = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const {data, error} = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      toast({
        title: "ログイン成功",
        description: "ダッシュボードに移動します",
      });

      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      toast({
        title: "ログインエラー",
        description: "メールアドレスまたはパスワードが正しくありません",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      // デモユーザーとしてダッシュボードに直接遷移
      router.push("/dashboard");
      toast({
        title: "デモモードで開始",
        description: "デモ用のダッシュボードを表示します",
      });
    } catch (error) {
      console.error("Demo access error:", error);
      toast({
        title: "エラー",
        description: "デモモードの開始に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{opacity: 0, y: 20}}
        animate={{opacity: 1, y: 0}}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center text-white space-y-4">
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-full shadow-lg">
              <BookOpen className="h-12 w-12 text-indigo-500" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">StudySync</h1>
          <p className="text-lg text-white/80">学習時間を可視化</p>
        </div>

        <Card className="backdrop-blur-sm bg-white/95 dark:bg-gray-800/95 shadow-2xl border-white/20">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              ログイン
            </CardTitle>
            <CardDescription className="text-center">
              アカウント情報を入力してください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({...formData, email: e.target.value})
                    }
                    className="pl-10"
                    placeholder="メールアドレスを入力"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">パスワード</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({...formData, password: e.target.value})
                    }
                    className="pl-10"
                    placeholder="パスワードを入力"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ログイン中...
                  </>
                ) : (
                  "ログイン"
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    または
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleDemoLogin}
                className="w-full"
                disabled={isLoading}
              >
                デモモードで開始
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Button
                variant="link"
                onClick={() => router.push("/signup")}
                className="text-sm text-muted-foreground hover:text-primary"
                disabled={isLoading}
              >
                アカウントをお持ちでない方はこちら
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
