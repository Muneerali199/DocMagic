import { NextRequest, NextResponse } from "next/server";
import { isDevelopmentMode } from "@/lib/mock-auth";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const timeframe = url.searchParams.get('timeframe') || '30d';
  
  // In development mode, return mock analytics data
  if (isDevelopmentMode()) {
    console.log('Development mode: Returning mock analytics data for timeframe:', timeframe);
    return NextResponse.json(generateMockAnalyticsData(timeframe));
  }

  // For production, you would implement real analytics logic here
  return NextResponse.json({ error: "Production analytics not implemented" }, { status: 501 });
}

// Mock analytics data generator for development mode
function generateMockAnalyticsData(timeframe: string) {
  const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
  const now = new Date();
  
  // Generate mock daily activity data
  const dailyActivity = Array.from({ length: days }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (days - 1 - i));
    return {
      date: date.toISOString().split('T')[0],
      documents: Math.floor(Math.random() * 20) + 5,
      views: Math.floor(Math.random() * 100) + 50,
      events: Math.floor(Math.random() * 50) + 20
    };
  });

  return {
    overview: {
      totalDocuments: 3450 + Math.floor(Math.random() * 1000),
      recentDocuments: 125 + Math.floor(Math.random() * 50),
      totalViews: 12500 + Math.floor(Math.random() * 3000),
      uniqueViews: 8900 + Math.floor(Math.random() * 1500),
      anonymousViews: 2100 + Math.floor(Math.random() * 500),
      avgViewDuration: 180 + Math.floor(Math.random() * 120),
      avgGenerationTime: 2.8 + Math.random() * 1.2
    },
    documentTypes: {
      'Resume': 1200 + Math.floor(Math.random() * 300),
      'Cover Letter': 850 + Math.floor(Math.random() * 200),
      'Business Proposal': 650 + Math.floor(Math.random() * 150),
      'Report': 450 + Math.floor(Math.random() * 100),
      'Presentation': 300 + Math.floor(Math.random() * 80),
      'Letter': 250 + Math.floor(Math.random() * 60)
    },
    eventTypes: {
      'Document Created': 2500 + Math.floor(Math.random() * 500),
      'Document Viewed': 8900 + Math.floor(Math.random() * 1500),
      'Document Downloaded': 1200 + Math.floor(Math.random() * 300),
      'Document Shared': 450 + Math.floor(Math.random() * 100),
      'Document Edited': 3200 + Math.floor(Math.random() * 600),
      'Template Used': 1800 + Math.floor(Math.random() * 400)
    },
    templateUsage: {
      'Modern Resume': 450 + Math.floor(Math.random() * 100),
      'Professional Cover Letter': 380 + Math.floor(Math.random() * 80),
      'Business Proposal': 290 + Math.floor(Math.random() * 60),
      'Project Report': 180 + Math.floor(Math.random() * 40),
      'Meeting Notes': 100 + Math.floor(Math.random() * 30),
      'Academic CV': 150 + Math.floor(Math.random() * 35)
    },
    dailyActivity: dailyActivity,
    topDocuments: [
      {
        id: 'doc-1',
        title: 'Senior Software Engineer Resume',
        views: 245,
        type: 'Resume',
        created: '2025-07-20T10:30:00Z'
      },
      {
        id: 'doc-2', 
        title: 'Marketing Manager Cover Letter',
        views: 198,
        type: 'Cover Letter',
        created: '2025-07-18T14:15:00Z'
      },
      {
        id: 'doc-3',
        title: 'Q3 Business Report',
        views: 156,
        type: 'Report',
        created: '2025-07-15T09:45:00Z'
      },
      {
        id: 'doc-4',
        title: 'Product Launch Proposal',
        views: 134,
        type: 'Business Proposal',
        created: '2025-07-12T16:20:00Z'
      },
      {
        id: 'doc-5',
        title: 'Data Analyst Resume',
        views: 112,
        type: 'Resume',
        created: '2025-07-10T11:10:00Z'
      }
    ]
  };
}
