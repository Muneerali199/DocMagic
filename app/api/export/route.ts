/**
 * Data Export API Route
 * Protected endpoint that generates and returns user data export as JSON
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchAllUserData, generateExportFile, generateExportFilename, compressData } from '@/lib/data-export';
import { createRoute } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication using Supabase
    const supabase = await createRoute();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to export your data." },
        { status: 401 }
      );
    }

    // Fetch all user data once — shared between compressed and plain response paths
    const filename = generateExportFilename(user.id);
    const userData = await fetchAllUserData(user.id);

    // Check if client supports compression via Accept-Encoding header
    const acceptEncoding = request.headers.get('accept-encoding') || '';
    const supportsGzip = acceptEncoding.includes('gzip');

    if (supportsGzip) {
      // Use compression for large datasets
      const compressedBlob = await compressData(userData);

      return new NextResponse(compressedBlob, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Content-Encoding": "gzip",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    } else {
      // Fallback to non-compressed blob for clients that don't support gzip
      const blob = generateExportFile(userData);

      return new NextResponse(blob, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    }
  } catch (error) {
    console.error("Error exporting user data:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to export data", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}
