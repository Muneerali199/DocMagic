"use client";

import { Card } from "@/components/ui/card";
import { 
  Eye, 
  Users, 
  Edit3, 
  Download, 
  Clock, 
  TrendingUp, 
  TrendingDown 
} from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: any;
  trend?: number;
  suffix?: string;
}

const StatCard = ({ title, value, icon: Icon, trend, suffix = "" }: StatCardProps) => {
  return (
    <Card className="p-4 glass-effect border border-border/40 hover:shadow-lg transition-all group">
      <div className="flex items-center justify-between mb-2">
        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-0.5 text-xs font-medium ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <div className="flex items-baseline gap-1">
          <motion.h3 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold bolt-gradient-text"
          >
            {value}
          </motion.h3>
          {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
        </div>
      </div>
    </Card>
  );
};

export function AnalyticsStatCards({ summary }: { summary: any }) {
  if (!summary) return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {[...Array(5)].map((_, i) => (
        <Card key={i} className="h-28 glass-effect animate-pulse" />
      ))}
    </div>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <StatCard 
        title="Total Views" 
        value={summary.total_views || 0} 
        icon={Eye} 
      />
      <StatCard 
        title="Unique Visitors" 
        value={summary.unique_views || 0} 
        icon={Users} 
      />
      <StatCard 
        title="Total Edits" 
        value={summary.total_edits || 0} 
        icon={Edit3} 
      />
      <StatCard 
        title="Avg. Read Time" 
        value={Math.round(summary.avg_view_duration || 0)} 
        icon={Clock} 
        suffix="sec"
      />
      <StatCard 
        title="Downloads" 
        value={summary.total_downloads || 0} 
        icon={Download} 
      />
    </div>
  );
}
