import {NextResponse} from "next/server";
import {supabase} from "@/lib/supabaseClient";
import {z} from "zod";

const goalSchema = z.object({
  dailyGoal: z.number().min(1),
  weeklyGoal: z.number().min(1),
  dailyTodo: z.string().optional(),
});

const DEMO_USER_ID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

export async function GET() {
  try {
    const {data: goals, error} = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", DEMO_USER_ID)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching goals:", error);
      throw error;
    }

    return NextResponse.json(
      goals || {
        dailyGoal: 120,
        weeklyGoal: 840,
        dailyTodo: "",
      }
    );
  } catch (error) {
    console.error("Error fetching goals:", error);
    return NextResponse.json({error: "Failed to fetch goals"}, {status: 500});
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = goalSchema.parse(body);

    const {data: existingGoal} = await supabase
      .from("goals")
      .select("id")
      .eq("user_id", DEMO_USER_ID)
      .single();

    const {data: goal, error} = await supabase
      .from("goals")
      .upsert({
        user_id: DEMO_USER_ID,
        daily_goal: validatedData.dailyGoal,
        weekly_goal: validatedData.weeklyGoal,
        daily_todo: validatedData.dailyTodo,
        ...(existingGoal ? {id: existingGoal.id} : {}),
      })
      .select()
      .single();

    if (error) {
      console.error("Error updating goals:", error);
      throw error;
    }

    return NextResponse.json(goal);
  } catch (error) {
    console.error("Error updating goals:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {error: "Invalid request data", details: error.errors},
        {status: 400}
      );
    }

    return NextResponse.json({error: "Failed to update goals"}, {status: 500});
  }
}
