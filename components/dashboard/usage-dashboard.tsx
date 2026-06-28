"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Loader2,
  Zap,
  FileText,
  TrendingUp,
  Download,
  Sparkles,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Clock,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CreditInfo {
  tier: string;
  total: number;
  used: number;
  remaining: number;
  resetAt: string | null;
  subscriptionStatus: string;
}

interface UsageData {
  credits: CreditInfo;
  totalDocuments: number;
  // FIX 5 (component): totalGenerations is supplied by the API and reflects ALL
  // action types, not just the top-5 slice exposed in topActions.
  totalGenerations: number;
  documentTypeBreakdown: { type: string; count: number }[];
  creditUsageOverTime: { date: string; credits: number }[];
  topModels: { model: string; count: number }[];
  topActions: { action: string; count: number }[];
  generationHistory: {
    id: string;
    title: string;
    type: string;
    created_at: string;
    template_id: string | null;
  }[];
  topTemplates: { templateId: string; count: number }[];
  range: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  resume: "#6366f1",
  presentation: "#8b5cf6",
  letter: "#10b981",
  diagram: "#f59e0b",
  cv: "#3b82f6",
  unknown: "#6b7280",
};

const CHART_COLORS = ["#6366f1", "#8b5cf6", "#10b981", "#f59e0b", "#3b82f6", "#ef4444"];

const RANGE_OPTIONS = [
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "90 Days", value: "90d" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  gradient,
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  gradient: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className="relative group overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 hover:border-white/20 hover:bg-white/8 transition-all duration-300"
    >
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${gradient}`}
      />
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium mb-1">{label}</p>
          <p className="text-3xl font-extrabold tracking-tight">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} opacity-80`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
}

function CreditMeter({ credits }: { credits: CreditInfo }) {
  const pct = credits.total > 0 ? Math.min(100, (credits.used / credits.total) * 100) : 0;
  const color =
    pct > 85 ? "#ef4444" : pct > 60 ? "#f59e0b" : "#10b981";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.4 }}
      className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 col-span-full lg:col-span-2"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-primary/10">
          <Zap className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-lg">AI Credit Usage</h3>
          <p className="text-xs text-muted-foreground capitalize">
            {credits.tier} plan · {credits.subscriptionStatus}
          </p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-2xl font-extrabold" style={{ color }}>
            {credits.remaining.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">remaining</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-4 rounded-full bg-white/10 overflow-hidden mb-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
          className="h-full rounded-full transition-colors"
          style={{ background: `linear-gradient(90deg, ${color}99, ${color})` }}
        />
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{credits.used.toLocaleString()} used</span>
        <span>{credits.total.toLocaleString()} total</span>
      </div>

      {credits.resetAt && (
        <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Resets on {new Date(credits.resetAt).toLocaleDateString()}
        </p>
      )}
    </motion.div>
  );
}

// ─── Supabase client ──────────────────────────────────────────────────────────
// FIX 1 (component): Create the client once at module scope so it is a stable
// reference. Calling createClient() inside the component body produced a new
// object on every render, making `supabase` appear in the useCallback deps
// array and causing fetchData — and therefore the useEffect — to re-run on
// every render, creating an infinite refetch loop.
const supabaseClient = createClient();

// ─── Main Component ───────────────────────────────────────────────────────────

export default function UsageDashboard() {
  const [data, setData] = useState<UsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [range, setRange] = useState("30d");
  const [isExporting, setIsExporting] = useState(false);
  const router = useRouter();

  const fetchData = useCallback(
    async (selectedRange: string) => {
      setIsLoading(true);
      try {
        const {
          data: { session },
        } = await supabaseClient.auth.getSession();
        if (!session) {
          router.push("/auth/signin");
          return;
        }

        const res = await fetch(`/api/usage-dashboard?range=${selectedRange}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch usage data");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Usage dashboard error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    fetchData(range);
  }, [range, fetchData]);

  // ── CSV Export ──────────────────────────────────────────────────────────────
  const exportCSV = () => {
    if (!data) return;
    setIsExporting(true);

    const rows: string[][] = [
      ["Date", "Credits Used"],
      ...data.creditUsageOverTime.map((r) => [r.date, String(r.credits)]),
      [],
      ["Document Type", "Count"],
      ...data.documentTypeBreakdown.map((r) => [r.type, String(r.count)]),
      [],
      ["AI Model", "Uses"],
      ...data.topModels.map((r) => [r.model, String(r.count)]),
      [],
      ["Action Type", "Count"],
      ...data.topActions.map((r) => [r.action, String(r.count)]),
    ];

    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `draftdeckai-usage-${range}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setIsExporting(false);
  };

  // ── Loading State ───────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
        <div className="absolute inset-0 mesh-gradient opacity-20" />
        <SiteHeader />
        <div className="flex-1 flex items-center justify-center relative z-10">
          <div className="text-center glass-effect p-12 rounded-3xl border border-white/10">
            <div className="relative mx-auto mb-6 w-20 h-20">
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
              <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
                <BarChart3 className="h-10 w-10 text-primary" />
              </div>
            </div>
            <h2 className="text-xl font-bold mb-2">Loading Usage Dashboard</h2>
            <p className="text-muted-foreground flex items-center gap-2 justify-center">
              <Loader2 className="h-4 w-4 animate-spin" />
              Aggregating your data…
            </p>
          </div>
        </div>
      </div>
    );
  }

  const creditPct =
    data && data.credits.total > 0
      ? Math.round((data.credits.used / data.credits.total) * 100)
      : 0;

  // FIX 3 (component): Parse YYYY-MM-DD strings in UTC so that toLocaleDateString
  // does not shift the displayed day for users in negative UTC-offset timezones.
  // The API derives all dates via toISOString().slice(0,10) (UTC), so we must
  // interpret them as UTC midnight to keep chart labels consistent.
  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    const d = new Date(Date.UTC(year, month - 1, day));
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 mesh-gradient opacity-20" />
      <div className="floating-orb w-[500px] h-[500px] bolt-gradient opacity-[0.07] top-[-100px] left-[-100px] blur-[120px]" />
      <div className="floating-orb w-[400px] h-[400px] bolt-gradient opacity-[0.05] bottom-[-50px] right-[-50px] blur-[100px]" />

      <SiteHeader />

      <main className="flex-1 p-4 md:p-10 relative z-10 max-w-7xl mx-auto w-full">
        {/* ── Header ── */}
        <div className="mb-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect border border-white/10 mb-6 shimmer"
          >
            <Sparkles className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-bold tracking-tight">Usage Intelligence</span>
            <Activity className="h-4 w-4 text-primary" />
          </motion.div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h1 className="text-5xl font-extrabold bolt-gradient-text mb-3 tracking-tighter">
                Usage Dashboard
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                Track your AI credit consumption, document generation activity, template usage, and
                export detailed reports.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Range selector */}
              <div className="flex items-center gap-1 glass-effect border border-white/10 rounded-xl p-1">
                {RANGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    id={`range-${opt.value}`}
                    onClick={() => setRange(opt.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      range === opt.value
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Refresh */}
              <Button
                id="refresh-usage"
                variant="outline"
                size="sm"
                onClick={() => fetchData(range)}
                className="glass-effect border-white/10 h-10"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>

              {/* Export CSV */}
              <Button
                id="export-usage-csv"
                onClick={exportCSV}
                disabled={!data || isExporting}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold h-10 px-5"
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Export CSV
              </Button>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {data && (
            <motion.div
              key={range}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
              className="space-y-8"
            >
              {/* ── Stat Cards ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <CreditMeter credits={data.credits} />

                <StatCard
                  icon={FileText}
                  label="Total Documents"
                  value={data.totalDocuments.toLocaleString()}
                  sub="All-time generated"
                  gradient="from-blue-500/20 to-cyan-500/20"
                  delay={0.1}
                />
                <StatCard
                  icon={TrendingUp}
                  label="Credits Used"
                  value={data.credits.used.toLocaleString()}
                  sub={`${creditPct}% of quota`}
                  gradient="from-violet-500/20 to-purple-500/20"
                  delay={0.2}
                />
                {/* FIX 2 (component): Use server-supplied totalGenerations which
                     counts ALL action_type rows, not just the top-5 slice that
                     topActions exposes. Summing topActions undercounted when
                     there were more than 5 distinct action types. */}
                <StatCard
                  icon={Zap}
                  label="AI Generations"
                  value={data.totalGenerations.toLocaleString()}
                  sub={`Last ${range}`}
                  gradient="from-amber-500/20 to-orange-500/20"
                  delay={0.3}
                />
              </div>

              {/* ── Credit Usage Over Time ── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold">Credit Usage Over Time</h2>
                  <span className="ml-auto text-xs text-muted-foreground uppercase tracking-wider">
                    Daily · {range}
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={data.creditUsageOverTime}>
                    <defs>
                      <linearGradient id="creditGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDate}
                      tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      interval={Math.floor(data.creditUsageOverTime.length / 6)}
                    />
                    <YAxis
                      tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={40}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(10,10,20,0.9)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "12px",
                        color: "#fff",
                      }}
                      labelFormatter={(l) => formatDate(l as string)}
                      formatter={(v: number) => [`${v} credits`, "Used"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="credits"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      fill="url(#creditGradient)"
                      dot={false}
                      activeDot={{ r: 5, fill: "#6366f1" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>

              {/* ── Two-column: Doc Type + AI Models ── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Document Type Breakdown */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-xl bg-emerald-500/10">
                      <PieChartIcon className="h-5 w-5 text-emerald-400" />
                    </div>
                    <h2 className="text-xl font-bold">Document Type Breakdown</h2>
                  </div>
                  {data.documentTypeBreakdown.length > 0 ? (
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      <ResponsiveContainer width={200} height={200}>
                        <PieChart>
                          <Pie
                            data={data.documentTypeBreakdown}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={85}
                            dataKey="count"
                            nameKey="type"
                            paddingAngle={3}
                          >
                            {data.documentTypeBreakdown.map((entry, index) => (
                              <Cell
                                key={entry.type}
                                fill={TYPE_COLORS[entry.type] || CHART_COLORS[index % CHART_COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              background: "rgba(10,10,20,0.9)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              borderRadius: "12px",
                              color: "#fff",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex-1 space-y-2">
                        {data.documentTypeBreakdown.map((entry, i) => (
                          <div key={entry.type} className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{
                                  background:
                                    TYPE_COLORS[entry.type] || CHART_COLORS[i % CHART_COLORS.length],
                                }}
                              />
                              <span className="text-sm capitalize font-medium">{entry.type}</span>
                            </div>
                            <span className="text-sm text-muted-foreground font-bold">
                              {entry.count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <EmptyState label="No documents yet" />
                  )}
                </motion.div>

                {/* Most Used AI Models */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-xl bg-violet-500/10">
                      <Sparkles className="h-5 w-5 text-violet-400" />
                    </div>
                    <h2 className="text-xl font-bold">Most Used AI Models</h2>
                  </div>
                  {data.topModels.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={data.topModels} layout="vertical">
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(255,255,255,0.05)"
                          horizontal={false}
                        />
                        <XAxis
                          type="number"
                          tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          type="category"
                          dataKey="model"
                          tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                          width={80}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "rgba(10,10,20,0.9)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "12px",
                            color: "#fff",
                          }}
                          formatter={(v: number) => [v, "Uses"]}
                        />
                        <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                          {data.topModels.map((_, index) => (
                            <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyState label="No model data yet" />
                  )}
                </motion.div>
              </div>

              {/* ── Most Used Action Types ── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-amber-500/10">
                    <BarChart3 className="h-5 w-5 text-amber-400" />
                  </div>
                  <h2 className="text-xl font-bold">Top Generation Actions</h2>
                </div>
                {data.topActions.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data.topActions}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis
                        dataKey="action"
                        tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        width={36}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "rgba(10,10,20,0.9)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "12px",
                          color: "#fff",
                        }}
                        formatter={(v: number) => [v, "Times Used"]}
                      />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                        {data.topActions.map((_, index) => (
                          <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState label="No generation activity in this period" />
                )}
              </motion.div>

              {/* ── Recent Generation History ── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-blue-500/10">
                    <Clock className="h-5 w-5 text-blue-400" />
                  </div>
                  <h2 className="text-xl font-bold">Recent Generation History</h2>
                  <span className="ml-auto text-xs text-muted-foreground">Last 20 documents</span>
                </div>

                {data.generationHistory.length > 0 ? (
                  <div className="space-y-2">
                    {data.generationHistory.map((doc, i) => (
                      <motion.div
                        key={doc.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * i }}
                        className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/3 hover:border-white/10 hover:bg-white/5 transition-all group"
                      >
                        <div
                          className="w-2 h-8 rounded-full flex-shrink-0"
                          style={{
                            background:
                              TYPE_COLORS[doc.type] || CHART_COLORS[i % CHART_COLORS.length],
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate text-sm">{doc.title || "Untitled"}</p>
                          <p className="text-xs text-muted-foreground capitalize">{doc.type}</p>
                        </div>
                        <p className="text-xs text-muted-foreground flex-shrink-0">
                          {new Date(doc.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <EmptyState label="No documents generated yet" />
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="p-4 rounded-2xl bg-white/5 mb-4">
        <BarChart3 className="h-8 w-8 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground text-sm">{label}</p>
    </div>
  );
}
