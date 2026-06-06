"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Presentation,
  Network,
  Globe,
  Megaphone,
  Calendar,
  Download,
  Eye,
  Trash2,
  Loader2,
  Search,
  Filter,
  Clock,
  TrendingUp,
  Mail,
  Edit,
  Sparkles,
  FileCode,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { getThemeById } from "@/lib/presentation-themes";
import { SlideCard, Slide } from "@/components/presentation/real-time-generator";
import { ResumePreview } from "@/components/resume/resume-preview";
import { logger } from "@/lib/logger";
import { DashboardPagination } from "@/components/ui/pagination";
import { DashboardPageSkeleton } from "@/components/skeletons";

type ContentType = "resume" | "presentation" | "diagram" | "letter" | "generated";

interface HistoryItem {
  id: string;
  type: ContentType;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
  preview_url?: string;
  data?: any;
}

const contentTypeConfig = {
  resume: {
    icon: FileText,
    label: "Resumes",
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    route: "/resume-editor",
    gradient: "from-blue-500 to-cyan-500",
  },
  presentation: {
    icon: Presentation,
    label: "Presentations",
    color: "text-purple-500",
    bgColor: "bg-purple-50",
    route: "/presentation",
    gradient: "from-purple-500 to-pink-500",
  },
  generated: {
    icon: Sparkles,
    label: "Documents",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    route: "/documents",
    gradient: "from-blue-600 to-indigo-600",
  },
  diagram: {
    icon: Network,
    label: "Diagrams",
    color: "text-green-500",
    bgColor: "bg-green-50",
    route: "/diagram",
    gradient: "from-green-500 to-emerald-500",
  },
  letter: {
    icon: Mail,
    label: "Letters",
    color: "text-orange-500",
    bgColor: "bg-orange-50",
    route: "/letter",
    gradient: "from-orange-500 to-amber-500",
  },
};

function getPresentationSlides(raw: any): any[] {
  const content = raw?.content || raw || {};
  const directSlides = content.slides ?? raw?.slides;
  if (Array.isArray(directSlides)) return directSlides;
  if (Array.isArray(directSlides?.slides)) return directSlides.slides;
  if (Array.isArray(content?.outlines)) return content.outlines;
  return [];
}

function getPresentationThemeId(raw: any): string {
  const content = raw?.content || raw || {};
  return content.themeId || content.template || raw?.themeId || raw?.template || 'peach';
}

function getDocumentDescription(doc: any): string {
  const content = doc.content || {};
  const metadata = doc.metadata || content.metadata || {};
  
  switch (doc.type) {
    case 'resume':
      return content.resumeData?.name || content.name || 'Resume';
    case 'presentation':
      const slides = getPresentationSlides(doc);
      return `${slides.length || 0} slides`;
    case 'diagram':
      return content.type || 'Diagram';
    case 'letter':
      return content.letter_type || content.type || 'Letter';
    case 'generated':
      const sections = metadata.sections || doc.sections || content.sections || [];
      return `${sections.length || 0} sections • ${doc.document_type?.replace(/-/g, ' ') || 'AI Document'}`;
    default:
      return doc.type || 'Document';
  }
}

const ResumePreviewMini = ({ data, title }: { data: any, title: string }) => {
  const [scale, setScale] = useState(0.2);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const updateScale = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        if (width > 0) {
          setScale(width / 794);
        }
      }
    };
    updateScale();
    const observer = new ResizeObserver(() => updateScale());
    observer.observe(containerRef.current);
    window.addEventListener('resize', updateScale);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, []);

  let resumeData = data;
  if (data?.resumeData) resumeData = data.resumeData;
  const template = data?.template || data?.templateId || 'modern';

  return (
    <div ref={containerRef} className="h-full w-full relative cursor-pointer overflow-hidden bg-white">
      <div className="absolute top-0 left-0 origin-top-left" style={{ width: '794px', height: '1123px', transform: `scale(${scale})` }}>
        <ResumePreview resume={resumeData} template={template} showControls={false} layoutMode="fixed" />
      </div>
    </div>
  );
};

const PresentationPreview = ({ slides, title, themeId }: { slides: Slide[], title: string, themeId?: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [scale, setScale] = useState(0.2);
  const containerRef = useRef<HTMLDivElement>(null);
  const theme = getThemeById(themeId || 'peach');

  useEffect(() => {
    if (!containerRef.current) return;
    const updateScale = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        if (width > 0) {
          setScale(width / 1200);
        }
      }
    };
    updateScale();
    const observer = new ResizeObserver(() => updateScale());
    observer.observe(containerRef.current);
    window.addEventListener('resize', updateScale);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, []);

  useEffect(() => {
    if (!isHovered || slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isHovered, slides.length]);

  if (!slides || slides.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4" style={{ backgroundColor: theme.colors.background }}>
        <Presentation className="h-8 w-8" style={{ color: theme.colors.accent }} />
      </div>
    );
  }

  const slide = slides[currentIndex] || slides[0];

  return (
    <div
      ref={containerRef}
      className="h-full w-full relative group/slideshow cursor-pointer flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: theme.colors.background }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setCurrentIndex(0); }}
    >
      <div className="absolute top-0 left-0 origin-top-left" style={{ width: '1200px', height: '675px', transform: `scale(${scale})` }}>
        <SlideCard slide={slide} theme={theme} getGradientClass={() => theme.colors.gradient} isPreview={true} />
      </div>
      <div className="absolute bottom-2 right-2 text-[10px] px-2 py-0.5 rounded-full backdrop-blur-md font-bold z-20" style={{ backgroundColor: `${theme.colors.foreground}cc`, color: theme.colors.background }}>
        {currentIndex + 1} / {slides.length}
      </div>
      {isHovered && slides.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 z-20" style={{ backgroundColor: `${theme.colors.muted}80` }}>
          <div className="h-full transition-all duration-300" style={{ backgroundColor: theme.colors.accent, width: `${((currentIndex + 1) / slides.length) * 100}%` }} />
        </div>
      )}
    </div>
  );
};

function HistoryDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const supabase = createClient();

  // Validating and clamping URL parameters
  const rawPage = Number(searchParams?.get("page"));
  const rawPageSize = Number(searchParams?.get("pageSize"));
  const allowedPageSizes = [10, 20, 50];

  const currentPage = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const pageSize = Number.isInteger(rawPageSize) && allowedPageSizes.includes(rawPageSize) ? rawPageSize : 20;

  // Persisting tab state from URL
  const urlTab = (searchParams?.get("tab") as ContentType | "all") || "all";
  const [activeTab, setActiveTab] = useState<ContentType | "all">(urlTab);
  
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalItems, setTotalItems] = useState(0); 
  const [stats, setStats] = useState({
    total: 0,
    resume: 0,
    presentation: 0,
    generated: 0,
    diagram: 0,
    letter: 0,
  });

  // Helper to preserve existing URL search params while making targeted updates
  const updateQueryParams = (updates: Record<string, string | number>) => {
    const params = new URLSearchParams(searchParams?.toString());
    Object.entries(updates).forEach(([key, value]) => params.set(key, String(value)));
    router.push(`?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, activeTab]);

  useEffect(() => {
    let filtered = items;
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredItems(filtered);
  }, [searchQuery, items]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) {
        router.push("/auth/signin");
        return;
      }

      logger.info(null, '📋 Fetching history for user:', user.id);

      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase.from("documents").select("*", { count: "exact" }).eq("user_id", user.id);
      
      if (activeTab !== "all") {
        query = query.eq("type", activeTab);
      }

      const { data: documents, count, error } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      // Handle Out-Of-Bounds Pagination
      if (documents && documents.length === 0 && count && count > 0) {
        const lastValidPage = Math.ceil(count / pageSize);
        if (currentPage !== lastValidPage) {
          updateQueryParams({ page: lastValidPage });
          return;
        }
      }

      if (activeTab === "all") {
          const typeCounts = await Promise.all(
            Object.keys(contentTypeConfig).map(type => 
              supabase.from("documents").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("type", type)
            )
          );
          
          setStats({
            total: count || 0,
            resume: typeCounts[0].count || 0,
            presentation: typeCounts[1].count || 0,
            generated: typeCounts[2].count || 0,
            diagram: typeCounts[3].count || 0,
            letter: typeCounts[4].count || 0,
          });
      }

      setTotalItems(count || 0);

      const docItems: HistoryItem[] = (documents || []).map((doc: any) => {
        const content = doc.content || {};
        const data = doc.type === 'resume' ? (content.resumeData || content) : doc;

        return {
          id: doc.id,
          type: doc.type as ContentType,
          title: doc.title || `Untitled ${doc.type}`,
          description: getDocumentDescription(doc),
          created_at: doc.created_at,
          updated_at: doc.updated_at,
          data: data,
        };
      });

      setItems(docItems);

    } catch (error) {
      console.error("Error fetching history:", error);
      toast({
        title: "Error",
        description: "Failed to load history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = (item: HistoryItem) => {
    if (item.type === 'generated') {
      router.push(`/documents/${item.id}`);
      return;
    }
    const config = contentTypeConfig[item.type];
    router.push(`${config.route}?id=${item.id}`);
  };

  const renderPreview = (item: HistoryItem) => {
    const getData = (data: any, ...paths: string[]): any => {
      if (!data) return null;
      for (const path of paths) {
        const keys = path.split('.');
        let value = data;
        for (const key of keys) {
          value = value?.[key];
          if (value === undefined) break;
        }
        if (value !== undefined && value !== null) return value;
      }
      return null;
    };

    switch (item.type) {
      case "resume":
        return <ResumePreviewMini data={item.data} title={item.title} />;
      case "presentation":
        const slides = getPresentationSlides(item.data);
        const themeId = getPresentationThemeId(item.data);
        return <PresentationPreview slides={slides} title={item.title} themeId={themeId} />;
      case "generated":
        const metadata = item.data?.metadata || {};
        const docSections = metadata.sections || item.data?.sections || [];
        return (
          <div className="p-4 text-[8px] leading-tight h-full overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-md relative flex flex-col">
            <div className="font-bold text-[10px] mb-2 text-blue-600 dark:text-blue-400 border-b pb-1 flex items-center justify-between">
              <span className="truncate pr-2">{item.title}</span>
              <FileCode className="h-3 w-3 flex-shrink-0" />
            </div>
            <div className="space-y-3 mt-2 flex-1 overflow-hidden">
              {docSections.slice(0, 4).map((section: any, idx: number) => (
                <div key={idx} className="border-l-2 border-blue-100 dark:border-blue-900/50 pl-2">
                  <div className="font-semibold text-gray-800 dark:text-gray-200 mb-0.5 truncate">{section.title}</div>
                  <div className="text-gray-500 dark:text-gray-400 line-clamp-2">{section.content}</div>
                </div>
              ))}
            </div>
            {docSections.length > 4 && (
              <div className="text-[6px] text-blue-400 font-medium italic mt-2 text-center bg-blue-50/50 dark:bg-blue-950/30 py-1 rounded">
                + {docSections.length - 4} more sections
              </div>
            )}
            <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10">
               <Button size="sm" variant="outline" className="h-7 text-[10px] bg-white dark:bg-gray-800" onClick={(e) => { e.stopPropagation(); handleView(item); }}>
                 <Edit className="h-3 w-3 mr-1" /> Edit
               </Button>
            </div>
          </div>
        );
      case "diagram":
        return (
          <div className="h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-green-50 to-emerald-50">
            <Network className="h-8 w-8 text-green-500 mb-2" />
            <div className="text-[8px] font-medium text-gray-700 text-center">
              {item.data?.type || item.data?.diagramType || "Diagram"}
            </div>
            <div className="mt-2 flex gap-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-3 h-3 rounded-full bg-green-200 border border-green-300" />
              ))}
            </div>
            <div className="flex gap-0.5 mt-1">
              <div className="w-6 h-0.5 bg-green-300" />
              <div className="w-6 h-0.5 bg-green-300" />
            </div>
          </div>
        );
      case "letter":
        const letterData = item.data?.letterData || item.data;
        const recipientName = getData(letterData, 'to.name', 'recipient.name', 'recipientName', 'to');
        const senderName = getData(letterData, 'from.name', 'sender.name', 'senderName', 'from');
        const letterContent = getData(letterData, 'content', 'body', 'letterContent', 'text');
        const letterType = getData(letterData, 'letter_type', 'letterType', 'type');
        const letterDate = getData(letterData, 'date', 'createdAt');
        const subject = getData(letterData, 'subject', 'title');

        return (
          <div className="p-3 text-[6px] leading-tight h-full overflow-hidden bg-gradient-to-br from-orange-50 to-amber-50">
            {letterDate && (
              <div className="mb-1 text-right text-gray-500 text-[5px]">
                {new Date(letterDate).toLocaleDateString()}
              </div>
            )}
            {subject && (
              <div className="mb-1 font-semibold text-gray-800 text-[7px]">
                Re: {subject}
              </div>
            )}
            <div className="mb-1">
              <div className="text-gray-700 font-medium">
                Dear {typeof recipientName === 'string' ? recipientName : 'Recipient'},
              </div>
            </div>
            <div className="text-gray-600 line-clamp-4">
              {typeof letterContent === 'string'
                ? letterContent.substring(0, 150) + (letterContent.length > 150 ? '...' : '')
                : letterType
                  ? `${letterType} letter`
                  : "Letter content..."}
            </div>
            <div className="mt-2 text-gray-700">
              <div>Sincerely,</div>
              <div className="font-medium">
                {typeof senderName === 'string' ? senderName : 'Sender'}
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="h-full flex items-center justify-center">
            <FileText className="h-12 w-12 text-gray-300" />
          </div>
        );
    }
  };

  const handleDelete = async (item: HistoryItem) => {
    if (!confirm(`Are you sure you want to delete "${item.title}"?`)) return;

    try {
      const { error } = await supabase.from('documents').delete().eq("id", item.id);
      if (error) throw error;

      toast({ title: "Deleted", description: `${item.title} has been deleted` });
      fetchHistory();
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({ title: "Error", description: "Failed to delete item", variant: "destructive" });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 mesh-gradient opacity-20"></div>
      <div className="floating-orb w-32 h-32 sm:w-48 sm:h-48 bolt-gradient opacity-15 top-20 -left-24"></div>
      <div className="floating-orb w-24 h-24 sm:w-36 sm:h-36 bolt-gradient opacity-20 bottom-20 -right-18"></div>
      <div className="floating-orb w-40 h-40 sm:w-56 sm:h-56 bolt-gradient opacity-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%23000000' fill-opacity='1'%3e%3ccircle cx='30' cy='30' r='1'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")` }} />

      <SiteHeader />
      <div className="flex-1 p-4 md:p-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect mb-4 shimmer">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Document History</span>
              <Clock className="h-4 w-4 text-blue-500" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="bolt-gradient-text">Your Created Documents</span>
            </h1>
            <p className="text-muted-foreground">View and manage all your created content in one place</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Card className="p-3 sm:p-4 glass-effect border border-border/40 hover:shadow-lg transition-all">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                <span className="text-xs sm:text-sm text-muted-foreground">Total</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold bolt-gradient-text">{stats.total}</p>
            </Card>

            {Object.entries(contentTypeConfig).map(([type, config]) => {
              const Icon = config.icon;
              return (
                <Card
                  key={type}
                  className={`p-3 sm:p-4 glass-effect border border-border/40 cursor-pointer hover:scale-105 hover:shadow-lg transition-all ${activeTab === type ? 'ring-2 ring-yellow-400 border-yellow-400/50' : ''}`}
                  onClick={() => {
                     setActiveTab(type as ContentType);
                     updateQueryParams({ tab: type, page: 1, pageSize });
                  }}
                >
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
                    <div className={`p-1 sm:p-1.5 rounded-lg ${config.bgColor}`}>
                      <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${config.color}`} />
                    </div>
                    <span className="text-xs sm:text-sm text-muted-foreground truncate">{config.label}</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold">{stats[type as ContentType]}</p>
                </Card>
              );
            })}
          </div>

          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search your content (Current Page)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-border/40 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 glass-effect bg-background/50 text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => {
              setActiveTab(v as ContentType | "all");
              updateQueryParams({ tab: v, page: 1, pageSize });
          }}>
            <TabsContent value={activeTab} className="space-y-4">
              {isLoading ? (
                <DashboardPageSkeleton />
              ) : filteredItems.length === 0 ? (
                <Card className="p-12 text-center glass-effect border border-border/40">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full bolt-gradient flex items-center justify-center">
                      <Sparkles className="h-10 w-10 text-white" />
                    </div>
                    <p className="text-foreground text-lg font-medium">No content found</p>
                    <p className="text-muted-foreground text-sm">Start creating amazing documents!</p>
                  </div>
                </Card>
              ) : (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 items-start">
                    {filteredItems.map((item) => {
                      const config = contentTypeConfig[item.type];
                      const Icon = config.icon;
                      let containerBg = `bg-gradient-to-br ${config.gradient}`;
                      if (item.type === 'presentation') containerBg = ""; 

                      return (
                        <Card
                          key={item.id}
                          className="group relative overflow-hidden glass-effect border border-border/40 hover:border-yellow-400/50 hover:shadow-2xl transition-all duration-300 cursor-pointer"
                          onClick={() => handleView(item)}
                        >
                          <div className={`relative ${item.type === 'presentation' ? 'aspect-video' : 'aspect-[3/4]'} ${item.type !== 'presentation' ? containerBg : ''} overflow-hidden`}
                               style={item.type === 'presentation' ? { backgroundColor: getThemeById(getPresentationThemeId(item.data)).colors.background } : {}}>
                            <div className={`absolute inset-0 ${item.type === 'presentation' ? '' : 'bg-white dark:bg-gray-900 m-3 rounded-lg shadow-inner'} overflow-hidden`}>
                              {renderPreview(item)}
                            </div>
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 hidden sm:group-hover:flex items-center justify-center z-30">
                              <div className="flex gap-3">
                                <Button size="sm" className="bg-white text-gray-800 hover:bg-gray-100" onClick={(e) => { e.stopPropagation(); handleView(item); }}>
                                  <Eye className="h-4 w-4 mr-1" /> View
                                </Button>
                                <Button size="sm" variant="destructive" onClick={(e) => { e.stopPropagation(); handleDelete(item); }}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="absolute top-2 left-2">
                              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-sm`}>
                                <Icon className={`h-3 w-3 ${config.color}`} />
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-200">{config.label.slice(0, -1)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="p-3 sm:p-4 bg-background/50">
                            <h3 className="font-semibold text-foreground mb-1 line-clamp-1 group-hover:bolt-gradient-text transition-colors text-sm sm:text-base">
                              {item.title}
                            </h3>
                            {item.description && <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-1">{item.description}</p>}
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span className="hidden xs:inline">{formatDate(item.created_at)}</span>
                                <span className="xs:hidden">{formatDate(item.created_at).split(',')[0]}</span>
                              </div>
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost" className="h-7 px-2 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 sm:invisible sm:group-hover:visible transition-all" onClick={(e) => { e.stopPropagation(); handleView(item); }}>
                                  <Edit className="h-3 w-3 sm:mr-1" />
                                  <span className="hidden sm:inline">Edit</span>
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 px-2 sm:hidden" onClick={(e) => { e.stopPropagation(); handleView(item); }}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                  
                  <DashboardPagination 
                    totalItems={totalItems} 
                    currentPage={currentPage} 
                    pageSize={pageSize} 
                    className="mt-8 border-t border-border/40 pt-4"
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export function HistoryDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <DashboardPageSkeleton />
      </div>
    }>
      <HistoryDashboardContent />
    </Suspense>
  );
}
