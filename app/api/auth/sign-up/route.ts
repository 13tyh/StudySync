import {NextResponse} from "next/server";
import {z} from "zod";
import {supabase} from "@/lib/supabaseClient";

const signupSchema = z.object({
  name: z.string().min(2, "名前は2文字以上で入力してください"),
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(8, "パスワードは8文字以上で入力してください"),
  confirmPassword: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = signupSchema.parse(body);

    if (validatedData.password !== validatedData.confirmPassword) {
      return NextResponse.json(
        {error: "パスワードが一致しません"},
        {status: 400}
      );
    }

    // ユーザー登録
    const {
      data: {user},
      error: signUpError,
    } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          name: validatedData.name,
        },
      },
    });

    if (signUpError) {
      console.error("Signup error:", signUpError);
      return NextResponse.json({error: signUpError.message}, {status: 400});
    }

    return NextResponse.json({
      message: "確認メールを送信しました。メールを確認してください。",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {error: "入力データが無効です", details: error.errors},
        {status: 400}
      );
    }

    console.error("Unexpected error:", error);
    return NextResponse.json(
      {error: "サーバーエラーが発生しました"},
      {status: 500}
    );
  }
}
