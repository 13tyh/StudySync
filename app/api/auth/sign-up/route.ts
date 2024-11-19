import {NextResponse} from "next/server";
import {supabase} from "@/lib/supabaseClient";
import {z} from "zod";

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

    const {data, error} = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          name: validatedData.name,
        },
      },
    });

    if (error) {
      console.error("Error signing up:", error);
      return NextResponse.json({error: error.message}, {status: 500});
    }

    return NextResponse.json({message: "アカウント作成成功"});
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {error: "Invalid request data", details: error.errors},
        {status: 400}
      );
    }

    console.error("Unexpected error:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
