"use client";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { format, parseISO } from "date-fns";
import { Loader2, TrendingUp } from "lucide-react";

/**
 * Responsive area chart showing document views and unique visitors
 */
export function ViewsChart({
  data,
  isLoading = false,
  error,
}: {
  data: any[];
  isLoading?: boolean;
  error?: string | null;
}) {
  if (isLoading) {
    return (
      <Card className="flex h-[400px] items-center justify-center border border-border/40 glass-effect">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-[400px] border border-border/40 glass-effect p-6">
        <ErrorMessage title="Could not load view data" message={error} />
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="h-[400px] border border-border/40 glass-effect p-6">
        <EmptyState
          title="No view data available"
          description="Views and unique visitors will appear here once this document starts receiving traffic."
          icon={<TrendingUp className="h-6 w-6" aria-hidden="true" />}
          className="h-full"
        />
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-effect p-3 border border-border/40 rounded-lg shadow-xl">
          <p className="text-sm font-bold mb-1 text-foreground">
            {label ? format(parseISO(label), 'MMM dd, yyyy') : ''}
          </p>
          <div className="space-y-1">
            <p className="text-xs text-primary flex justify-between gap-4">
              <span>Views:</span> 
              <span className="font-bold">{payload[0].value}</span>
            </p>
            <p className="text-xs text-blue-500 flex justify-between gap-4">
              <span>Unique Visitors:</span> 
              <span className="font-bold">{payload[1].value}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6 glass-effect border border-border/40 h-[400px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold">Views Trend</h3>
          <p className="text-sm text-muted-foreground">Document traffic over time</p>
        </div>
      </div>
      
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorUnique" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(str) => {
                try {
                  return format(parseISO(str), 'MMM d');
                } catch (e) {
                  return str;
                }
              }}
              stroke="rgba(255,255,255,0.3)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.3)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
            <Area 
              type="monotone" 
              dataKey="views" 
              stroke="hsl(var(--primary))" 
              fillOpacity={1} 
              fill="url(#colorViews)" 
              strokeWidth={2}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
            <Area 
              type="monotone" 
              dataKey="unique_views" 
              stroke="#3b82f6" 
              fillOpacity={1} 
              fill="url(#colorUnique)" 
              strokeWidth={2}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
