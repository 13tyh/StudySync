// api/history/route.ts
import {NextResponse} from "next/server";
import {createRouteHandlerClient} from "@supabase/auth-helpers-nextjs";
import {cookies} from "next/headers";

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({cookies});

    // 認証ユーザーの取得
    const {
      data: {user},
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({error: "認証が必要です"}, {status: 401});
    }

    // 認証ユーザーの学習履歴を取得
    const {data, error} = await supabase
      .from("study_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", {ascending: false});

    if (error) {
      return NextResponse.json(
        {error: "学習記録の取得に失敗しました"},
        {status: 500}
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {error: "サーバーエラーが発生しました"},
      {status: 500}
    );
  }
}
