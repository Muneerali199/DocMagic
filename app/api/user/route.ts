import { createRoute } from "@/lib/supabase/server";
const { NextResponse } = require("next/server");

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const supabase = await createRoute();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { data, error } = await supabase
    .from("users")
    .select("*, subscription:subscriptions(*)")
    .eq("email", user.email)
    .single();

  if (error || !data) {
    return new NextResponse("User not found", { status: 404 });
  }

  return NextResponse.json({
    subscription: data.subscription || null,
  });
}