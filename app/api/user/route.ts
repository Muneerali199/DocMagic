import { createRoute } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const supabase = await createRoute();
  
  // Get the current user session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { data, error } = await supabase
    .from("users")
    .select("*, subscription:subscriptions(*)")
    .eq("email", session.user.email)
    .single();

  if (error || !data) {
    return new NextResponse("User not found", { status: 404 });
  }

  return NextResponse.json({
    subscription: data.subscription || null,
  });
}