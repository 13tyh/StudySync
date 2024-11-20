import {NextResponse} from "next/server";
import {supabase} from "@/lib/supabaseClient";
import {z} from "zod";
import {cookies} from "next/headers";
import {createRouteHandlerClient} from "@supabase/auth-helpers-nextjs";

const studySessionSchema = z.object({
  subject: z.string().min(1),
  duration: z.number().min(1),
  note: z.string().optional(),
  date: z.string().datetime(),
});

export async function GET() {
  try {
    // Route Handlerでの認証済みクライアントの作成
    const supabase = createRouteHandlerClient({cookies});

    // 認証ユーザーの取得
    const {
      data: {user},
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    // 認証ユーザーのセッション取得
    const {data: sessions, error} = await supabase
      .from("study_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("date", {ascending: false});

    if (error) {
      console.error("Error fetching sessions:", error);
      return NextResponse.json(
        {error: "Failed to fetch study sessions"},
        {status: error.code === "PGRST504" ? 504 : 500}
      );
    }

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({cookies});
    const {
      data: {user},
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    const body = await request.json();
    const validatedData = studySessionSchema.parse(body);

    const {error} = await supabase.from("study_sessions").insert({
      ...validatedData,
      user_id: user.id,
    });

    if (error) {
      console.error("Error inserting session:", error);
      return NextResponse.json(
        {error: "Failed to create study session"},
        {status: 500}
      );
    }

    return NextResponse.json(
      {message: "Study session created successfully"},
      {status: 201}
    );
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
