import {NextResponse} from "next/server";
import {createRouteHandlerClient} from "@supabase/auth-helpers-nextjs";
import {cookies} from "next/headers";
import {z} from "zod";

const goalSchema = z.object({
  dailyGoal: z.number().min(1),
  weeklyGoal: z.number().min(1),
  dailyTodo: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({error: "User ID is required"}, {status: 400});
    }

    const supabase = createRouteHandlerClient({cookies});
    const {data: goals, error} = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", userId)
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

    const supabase = createRouteHandlerClient({cookies});
    const {
      data: {user},
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {error: "User not authenticated"},
        {status: 401}
      );
    }

    const {error} = await supabase
      .from("goals")
      .upsert({user_id: user.id, ...validatedData});

    if (error) {
      console.error("Error saving goals:", error);
      return NextResponse.json({error: "Failed to save goals"}, {status: 500});
    }

    return NextResponse.json({message: "Goals saved successfully"});
  } catch (error) {
    console.error("Error saving goals:", error);
    return NextResponse.json({error: "Failed to save goals"}, {status: 500});
  }
}
