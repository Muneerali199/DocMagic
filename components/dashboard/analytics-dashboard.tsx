"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  BarChart3, 
  MousePointer2, 
  Lightbulb, 
  Sparkles,
  Loader2,
  ChevronRight
} from "lucide-react";
import { AnalyticsStatCards } from "./analytics/stat-cards";
import { ViewsChart } from "./analytics/views-chart";
import { EngagementTable } from "./analytics/engagement-table";
import { EditTimeline } from "./analytics/edit-timeline";
import { SuggestionsPanel } from "./analytics/suggestions-panel";
import { DocumentHeatmap } from "./analytics/document-heatmap";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Main Analytics Dashboard component for tracking document metrics and engagement
 */
export default function AnalyticsDashboard() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>("all");
  const [summary, setSummary] = useState<any>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedDocId !== "all") {
      fetchDocAnalytics(selectedDocId);
    } else {
      setSummary(null);
      setVersions([]);
    }
  }, [selectedDocId]);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth/signin");
        return;
      }

      // Fetch user's documents
      const response = await fetch('/api/analytics', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDocAnalytics = async (docId: string) => {
    setIsStatsLoading(true);
    setAnalyticsError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`/api/analytics/${docId}?range=30d`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      if (!response.ok) {
        throw new Error("Could not load analytics for this document.");
      }
      const data = await response.json();
      setSummary(data);

      // Fetch version history for this specific document
      const { data: vData } = await supabase
        .from('document_versions')
        .select('*')
        .eq('document_id', docId)
        .order('version_number', { ascending: false });
      setVersions(vData || []);
    } catch (error) {
      console.error('Error fetching doc analytics:', error);
      setSummary(null);
      setVersions([]);
      setAnalyticsError(error instanceof Error ? error.message : "Could not load analytics for this document.");
    } finally {
      setIsStatsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#030712]">
        <div className="absolute inset-0 mesh-gradient opacity-20"></div>
        <SiteHeader />
        <div className="flex-1 flex items-center justify-center relative z-10">
          <div className="text-center glass-effect p-12 rounded-3xl border border-white/10">
            <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-6" />
            <h2 className="text-xl font-bold mb-2">Analyzing Data</h2>
            <p className="text-muted-foreground">Calibrating analytics engine...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-background">
      {/* Dynamic background elements */}
      <div className="absolute inset-0 mesh-gradient opacity-20"></div>
      <div className="floating-orb w-[500px] h-[500px] bolt-gradient opacity-[0.07] top-[-100px] left-[-100px] blur-[120px]"></div>
      <div className="floating-orb w-[400px] h-[400px] bolt-gradient opacity-[0.05] bottom-[-50px] right-[-50px] blur-[100px]"></div>
      
      <SiteHeader />
      
      <main className="flex-1 p-4 md:p-10 relative z-10 max-w-7xl mx-auto w-full">
        <div className="mb-12">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect border border-white/10 mb-6 shimmer"
          >
            <Sparkles className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-bold tracking-tight">Intelligence Hub</span>
            <BarChart3 className="h-4 w-4 text-primary" />
          </motion.div>
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-5xl font-extrabold bolt-gradient-text mb-3 tracking-tighter">Document Analytics</h1>
              <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                Unlock deep insights into how your documents are performing. Track every view, download, and interaction in real-time.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <Select value={selectedDocId} onValueChange={setSelectedDocId}>
                  <SelectTrigger className="w-[320px] relative glass-effect border-white/10 font-bold h-12 rounded-xl">
                    <SelectValue placeholder="Choose a document to analyze" />
                  </SelectTrigger>
                  <SelectContent className="glass-effect border-white/10 rounded-xl max-h-[400px]">
                    <SelectItem value="all" className="font-bold">✨ All Documents Overview</SelectItem>
                    {documents.map((doc) => (
                      <SelectItem key={doc.id} value={doc.id} className="cursor-pointer">
                        <div className="flex items-center gap-3">
                          <span className="truncate max-w-[180px] font-medium">{doc.title}</span>
                          <Badge variant="outline" className="text-[9px] uppercase tracking-widest bg-primary/5 border-primary/20 text-primary">
                            {doc.type}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {selectedDocId === "all" ? (
            <motion.div
              key="all-docs-overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-10"
            >
              <AnalyticsStatCards summary={null} />
              
              <div className="flex flex-col items-center justify-center p-16 md:p-24 glass-effect rounded-[2.5rem] border border-white/5 text-center relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                 
                 <div className="relative z-10">
                    <div className="p-8 rounded-[2rem] bg-primary/10 border border-primary/20 mb-8 inline-block shadow-2xl shadow-primary/10">
                       <MousePointer2 className="h-16 w-16 text-primary animate-bounce" />
                    </div>
                    <h2 className="text-3xl font-black mb-4 tracking-tight">Ready for a Deep Dive?</h2>
                    <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10 leading-relaxed">
                      Select one of your documents from the menu above to unlock per-document traffic trends, engagement heatmaps, and personalized AI suggestions.
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
                       {documents.slice(0, 4).map((doc, idx) => (
                         <motion.button 
                           key={doc.id}
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: idx * 0.1 }}
                           onClick={() => setSelectedDocId(doc.id)}
                           className="flex flex-col p-6 glass-effect border border-white/5 hover:border-primary/50 hover:bg-white/5 rounded-2xl transition-all group/card text-left"
                         >
                           <div className="flex justify-between items-start mb-3">
                             <div className="p-2 rounded-lg bg-primary/10 text-primary">
                               <Sparkles className="h-4 w-4" />
                             </div>
                             <ChevronRight className="h-4 w-4 text-muted-foreground group-hover/card:text-primary group-hover/card:translate-x-1 transition-all" />
                           </div>
                           <p className="font-bold text-base truncate mb-1">{doc.title}</p>
                           <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{doc.type}</p>
                         </motion.button>
                       ))}
                    </div>
                 </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="specific-doc-stats"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-10"
            >
              {isStatsLoading ? (
                <div className="h-[600px] flex items-center justify-center glass-effect rounded-[2.5rem]">
                   <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <AnalyticsStatCards summary={summary} />
                  
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                    <div className="xl:col-span-8 space-y-10">
                      <ViewsChart
                        data={summary?.views_trend || []}
                        error={analyticsError}
                      />
                      
                      <Tabs defaultValue="engagement" className="w-full">
                        <div className="flex items-center justify-between mb-8">
                          <TabsList className="glass-effect p-1 border border-white/5 bg-black/20 h-12">
                            <TabsTrigger value="engagement" className="px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black text-xs uppercase tracking-wider h-10 rounded-lg">
                              Live Engagement
                            </TabsTrigger>
                            <TabsTrigger value="history" className="px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black text-xs uppercase tracking-wider h-10 rounded-lg">
                              Edit Timeline
                            </TabsTrigger>
                            <TabsTrigger value="heatmap" className="px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black text-xs uppercase tracking-wider h-10 rounded-lg">
                              Activity Matrix
                            </TabsTrigger>
                          </TabsList>
                        </div>
                        
                        <TabsContent value="engagement" className="mt-0 focus-visible:outline-none">
                          <EngagementTable
                            data={summary?.recent_activity || []}
                            error={analyticsError}
                          />
                        </TabsContent>
                        
                        <TabsContent value="history" className="mt-0 focus-visible:outline-none">
                          <EditTimeline versions={versions} />
                        </TabsContent>

                        <TabsContent value="heatmap" className="mt-0 focus-visible:outline-none">
                          <DocumentHeatmap data={summary?.views_trend?.map((t: any) => ({ date: t.date, count: t.views })) || []} />
                        </TabsContent>
                      </Tabs>
                    </div>
                    
                    <div className="xl:col-span-4 space-y-8">
                      <div className="sticky top-24">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 rounded-xl bg-yellow-500/10">
                            <Lightbulb className="h-6 w-6 text-yellow-500" />
                          </div>
                          <h3 className="text-2xl font-black tracking-tight">Growth Catalyst</h3>
                        </div>
                        <SuggestionsPanel suggestions={summary?.suggestions || []} />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// Internal Badge and UI components if not available globally
function Badge({ children, variant, className }: any) {
  const variants: any = {
    outline: "border-border text-foreground",
    secondary: "bg-secondary text-secondary-foreground"
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variants[variant || 'outline']} ${className}`}>
      {children}
    </span>
  );
}
