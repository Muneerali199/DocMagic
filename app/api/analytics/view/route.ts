import { createRoute } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const supabase = createRoute();
  
  try {
    const body = await request.json();
    const { document_id, view_duration = 0 } = body;

    if (!document_id) {
      return new NextResponse("Document ID is required", { status: 400 });
    }

    // Get client info
    const userAgent = request.headers.get('user-agent');
    const referrer = request.headers.get('referer');
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 
               request.headers.get('x-real-ip') || 
               request.headers.get('cf-connecting-ip') || 
               '0.0.0.0';

    // Check if document exists and is public
    const { data: document } = await supabase
      .from("documents")
      .select("id, user_id, content")
      .eq("id", document_id)
      .single();

    if (!document) {
      return new NextResponse("Document not found", { status: 404 });
    }

    // Only track views for public documents
    const content = document.content as any;
    if (!content?.isPublic) {
      return new NextResponse("Document is not public", { status: 403 });
    }

    // Insert anonymous document view
    await supabase
      .from("document_views")
      .insert({
        document_id,
        viewer_id: null, // Anonymous view
        view_duration,
        is_owner: false,
        is_anonymous: true,
        ip_address: ip,
        user_agent: userAgent,
        referrer
      });

    // Also insert analytics event for the document owner
    await supabase
      .from("document_analytics")
      .insert({
        document_id,
        user_id: document.user_id,
        event_type: 'viewed',
        metadata: { anonymous_view: true },
        ip_address: ip,
        user_agent: userAgent,
        referrer
      });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Anonymous view tracking error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
