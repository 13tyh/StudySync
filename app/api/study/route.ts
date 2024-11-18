import {NextResponse} from "next/server";
import {supabase} from "@/lib/supabaseClient";
import {z} from "zod";

const studySessionSchema = z.object({
  subject: z.string().min(1),
  duration: z.number().min(1),
  note: z.string().optional(),
  date: z.string().datetime(),
});

const DEMO_USER_ID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

export async function GET() {
  try {
    const {data: sessions, error} = await supabase
      .from("study_sessions")
      .select("*")
      .eq("user_id", DEMO_USER_ID)
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
    const body = await request.json();
    const validatedData = studySessionSchema.parse(body);

    const {data: session, error} = await supabase
      .from("study_sessions")
      .insert([
        {
          ...validatedData,
          user_id: DEMO_USER_ID,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating session:", error);
      return NextResponse.json(
        {error: "Failed to create study session"},
        {status: error.code === "PGRST504" ? 504 : 500}
      );
    }

    return NextResponse.json(session);
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
