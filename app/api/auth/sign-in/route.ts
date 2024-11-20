import {NextResponse} from "next/server";
import {z} from "zod";
import {supabase} from "@/lib/supabaseClient";

const signInSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(8, "パスワードは8文字以上で入力してください"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = signInSchema.parse(body);

    const {data, error} = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (error) {
      console.error("Sign-in error:", error);
      return NextResponse.json({error: error.message}, {status: 400});
    }

    return NextResponse.json({message: "ログイン成功"});
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
