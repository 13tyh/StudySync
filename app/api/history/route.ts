// api/history/route.ts
import {NextResponse} from "next/server";
import {supabase} from "@/lib/supabaseClient";

export async function GET() {
  try {
    // 認証ユーザーの取得
    const {
      data: {user},
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("認証エラー:", authError?.message);
      return NextResponse.json(
        {success: false, error: "認証が必要です"},
        {status: 401}
      );
    }

    // 認証ユーザーの学習履歴を取得（必要なカラムのみ）
    const {data, error} = await supabase
      .from("study_sessions")
      .select(
        `
        id,
        created_at,
        duration,
        subject,
        note
      `
      )
      .eq("user_id", user.id)
      .order("created_at", {ascending: false})
      .limit(50);

    if (error) {
      console.error("データ取得エラー:", error.message);
      return NextResponse.json(
        {success: false, error: "学習記録の取得に失敗しました"},
        {status: 500}
      );
    }

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
    });
  } catch (error) {
    console.error("サーバーエラー:", error);
    return NextResponse.json(
      {success: false, error: "サーバーエラーが発生しました"},
      {status: 500}
    );
  }
}
