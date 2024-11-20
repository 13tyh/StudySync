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
import {BookOpen, Mail, Lock, User, Loader2} from "lucide-react";
import {z} from "zod";

const signupSchema = z.object({
  name: z.string().min(2, "名前は2文字以上で入力してください"),
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(8, "パスワードは8文字以上で入力してください"),
  confirmPassword: z.string(),
});

const containerVariants = {
  hidden: {opacity: 0},
  visible: {opacity: 1, transition: {staggerChildren: 0.3}},
};

const itemVariants = {
  hidden: {opacity: 0, y: 20},
  visible: {opacity: 1, y: 0},
};

export default function SignupPage() {
  const router = useRouter();
  const {toast} = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    try {
      signupSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "アカウント作成成功",
          description: "確認メールを送信しました。メールを確認してください。",
        });
        router.push("/login");
      } else {
        toast({
          title: "エラー",
          description: result.error || "アカウント作成に失敗しました",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "エラー",
        description: "アカウント作成に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex flex-col items-center justify-center p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md space-y-8"
      >
        <motion.div
          variants={itemVariants}
          className="text-center text-white space-y-4"
        >
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-full shadow-lg">
              <BookOpen className="h-12 w-12 text-indigo-500" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">StudySync</h1>
          <p className="text-lg text-white/80">新規アカウント作成</p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="backdrop-blur-sm bg-white/95 dark:bg-gray-800/95 shadow-2xl border-white/20">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                アカウント作成
              </CardTitle>
              <CardDescription className="text-center">
                必要な情報を入力してください
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">名前</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({...formData, name: e.target.value})
                      }
                      className={`pl-10 ${errors.name ? "border-red-500" : ""}`}
                      placeholder="名前を入力"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

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
                      className={`pl-10 ${
                        errors.email ? "border-red-500" : ""
                      }`}
                      placeholder="メールアドレスを入力"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
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
                      className={`pl-10 ${
                        errors.password ? "border-red-500" : ""
                      }`}
                      placeholder="パスワードを入力"
                    />
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">パスワード（確認）</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className={`pl-10 ${
                        errors.confirmPassword ? "border-red-500" : ""
                      }`}
                      placeholder="パスワードを再入力"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      登録中...
                    </>
                  ) : (
                    "アカウントを作成"
                  )}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <Button
                  variant="link"
                  onClick={() => router.push("/login")}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  すでにアカウントをお持ちの方はこちら
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
