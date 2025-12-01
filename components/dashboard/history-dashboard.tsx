"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

type ContentType = "resume" | "presentation" | "diagram" | "website" | "campaign";

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
    route: "/resume-builder",
  },
  presentation: {
    icon: Presentation,
    label: "Presentations",
    color: "text-purple-500",
    bgColor: "bg-purple-50",
    route: "/presentation",
  },
  diagram: {
    icon: Network,
    label: "Diagrams",
    color: "text-green-500",
    bgColor: "bg-green-50",
    route: "/diagram",
  },
  website: {
    icon: Globe,
    label: "Websites",
    color: "text-orange-500",
    bgColor: "bg-orange-50",
    route: "/website-builder",
  },
  campaign: {
    icon: Megaphone,
    label: "Campaigns",
    color: "text-pink-500",
    bgColor: "bg-pink-50",
    route: "/campaign",
  },
};

export function HistoryDashboard() {
  const [activeTab, setActiveTab] = useState<ContentType | "all">("all");
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    resume: 0,
    presentation: 0,
    diagram: 0,
    website: 0,
    campaign: 0,
  });
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    filterItems();
  }, [activeTab, searchQuery, items]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/signin");
        return;
      }

      // Fetch all content types
      const [resumes, presentations, diagrams, websites, campaigns] = await Promise.all([
        fetchResumes(user.id),
        fetchPresentations(user.id),
        fetchDiagrams(user.id),
        fetchWebsites(user.id),
        fetchCampaigns(user.id),
      ]);

      const allItems = [
        ...resumes,
        ...presentations,
        ...diagrams,
        ...websites,
        ...campaigns,
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setItems(allItems);

      // Calculate stats
      setStats({
        total: allItems.length,
        resume: resumes.length,
        presentation: presentations.length,
        diagram: diagrams.length,
        website: websites.length,
        campaign: campaigns.length,
      });
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

  const fetchResumes = async (userId: string): Promise<HistoryItem[]> => {
    const { data, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching resumes:", error);
      return [];
    }

    return (data || []).map((resume) => ({
      id: resume.id,
      type: "resume" as ContentType,
      title: resume.title || "Untitled Resume",
      description: resume.personal_info?.name || "",
      created_at: resume.created_at,
      updated_at: resume.updated_at,
      data: resume,
    }));
  };

  const fetchPresentations = async (userId: string): Promise<HistoryItem[]> => {
    const { data, error } = await supabase
      .from("presentations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching presentations:", error);
      return [];
    }

    return (data || []).map((pres) => ({
      id: pres.id,
      type: "presentation" as ContentType,
      title: pres.title || "Untitled Presentation",
      description: `${pres.slides?.length || 0} slides`,
      created_at: pres.created_at,
      updated_at: pres.updated_at,
      data: pres,
    }));
  };

  const fetchDiagrams = async (userId: string): Promise<HistoryItem[]> => {
    const { data, error } = await supabase
      .from("diagrams")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching diagrams:", error);
      return [];
    }

    return (data || []).map((diagram) => ({
      id: diagram.id,
      type: "diagram" as ContentType,
      title: diagram.title || "Untitled Diagram",
      description: diagram.type || "Diagram",
      created_at: diagram.created_at,
      updated_at: diagram.updated_at,
      data: diagram,
    }));
  };

  const fetchWebsites = async (userId: string): Promise<HistoryItem[]> => {
    const { data, error } = await supabase
      .from("websites")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching websites:", error);
      return [];
    }

    return (data || []).map((website) => ({
      id: website.id,
      type: "website" as ContentType,
      title: website.title || "Untitled Website",
      description: website.style || "Website",
      created_at: website.created_at,
      updated_at: website.updated_at,
      data: website,
    }));
  };

  const fetchCampaigns = async (userId: string): Promise<HistoryItem[]> => {
    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching campaigns:", error);
      return [];
    }

    return (data || []).map((campaign) => ({
      id: campaign.id,
      type: "campaign" as ContentType,
      title: campaign.title || "Untitled Campaign",
      description: campaign.platform || "Campaign",
      created_at: campaign.created_at,
      updated_at: campaign.updated_at,
      data: campaign,
    }));
  };

  const filterItems = () => {
    let filtered = items;

    // Filter by type
    if (activeTab !== "all") {
      filtered = filtered.filter((item) => item.type === activeTab);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  };

  const handleView = (item: HistoryItem) => {
    const config = contentTypeConfig[item.type];
    router.push(`${config.route}?id=${item.id}`);
  };

  const handleDelete = async (item: HistoryItem) => {
    if (!confirm(`Are you sure you want to delete "${item.title}"?`)) return;

    try {
      const tableName = `${item.type}s`;
      const { error } = await supabase.from(tableName).delete().eq("id", item.id);

      if (error) throw error;

      toast({
        title: "Deleted",
        description: `${item.title} has been deleted`,
      });

      fetchHistory();
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Your Content History
            </span>
          </h1>
          <p className="text-gray-600">
            View and manage all your created content in one place
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="p-4 bg-white/50 backdrop-blur-sm border-2 border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-600">Total</span>
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
          </Card>

          {Object.entries(contentTypeConfig).map(([type, config]) => {
            const Icon = config.icon;
            return (
              <Card
                key={type}
                className="p-4 bg-white/50 backdrop-blur-sm border-2 border-gray-200 cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setActiveTab(type as ContentType)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`h-5 w-5 ${config.color}`} />
                  <span className="text-sm text-gray-600">{config.label}</span>
                </div>
                <p className="text-2xl font-bold">{stats[type as ContentType]}</p>
              </Card>
            );
          })}
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search your content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-400 focus:outline-none bg-white/50 backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ContentType | "all")}>
          <TabsList className="mb-6 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
            {Object.entries(contentTypeConfig).map(([type, config]) => (
              <TabsTrigger key={type} value={type}>
                {config.label} ({stats[type as ContentType]})
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredItems.length === 0 ? (
              <Card className="p-12 text-center bg-white/50 backdrop-blur-sm">
                <p className="text-gray-500 mb-4">No content found</p>
                <Button
                  onClick={() => router.push("/")}
                  className="bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  Create Something New
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item) => {
                  const config = contentTypeConfig[item.type];
                  const Icon = config.icon;

                  return (
                    <Card
                      key={item.id}
                      className="p-6 bg-white/50 backdrop-blur-sm border-2 border-gray-200 hover:border-blue-300 transition-all hover:scale-[1.02] cursor-pointer"
                      onClick={() => handleView(item)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-lg ${config.bgColor}`}>
                          <Icon className={`h-6 w-6 ${config.color}`} />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleView(item);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>

                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-1">
                          {item.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(item.created_at)}</span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
