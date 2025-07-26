"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({ 
  title, 
  value, 
  description, 
  trend, 
  trendValue, 
  icon, 
  className 
}: MetricCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600 dark:text-green-400';
      case 'down':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card className={cn("professional-card", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold bolt-gradient-text">{value}</div>
        {(description || trendValue) && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            {trend && trendValue && (
              <>
                {getTrendIcon()}
                <span className={getTrendColor()}>{trendValue}</span>
              </>
            )}
            {description && <span>{description}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface MiniChartCardProps {
  title: string;
  value: string | number;
  data: Array<{ date: string; value: number }>;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}

export function MiniChartCard({ title, value, data, change, changeType }: MiniChartCardProps) {
  return (
    <Card className="professional-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {change && (
            <Badge 
              variant={changeType === 'positive' ? 'default' : changeType === 'negative' ? 'destructive' : 'secondary'}
              className="text-xs"
            >
              {change}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold bolt-gradient-text mb-2">{value}</div>
        <ResponsiveContainer width="100%" height={60}>
          <LineChart data={data}>
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#6366f1" 
              strokeWidth={2}
              dot={false}
            />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background border rounded p-2 shadow-md">
                      <p className="text-sm">{`${label}: ${payload[0].value}`}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface AnalyticsInsightProps {
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function AnalyticsInsight({ type, title, description, action }: AnalyticsInsightProps) {
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-50 dark:bg-green-900/10';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10';
      case 'info':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10';
      case 'error':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/10';
      default:
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/10';
    }
  };

  const getTitleColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800 dark:text-green-200';
      case 'warning':
        return 'text-yellow-800 dark:text-yellow-200';
      case 'info':
        return 'text-blue-800 dark:text-blue-200';
      case 'error':
        return 'text-red-800 dark:text-red-200';
      default:
        return 'text-gray-800 dark:text-gray-200';
    }
  };

  const getDescriptionColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-700 dark:text-green-300';
      case 'warning':
        return 'text-yellow-700 dark:text-yellow-300';
      case 'info':
        return 'text-blue-700 dark:text-blue-300';
      case 'error':
        return 'text-red-700 dark:text-red-300';
      default:
        return 'text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className={cn("p-4 border-l-4", getTypeStyles())}>
      <h4 className={cn("font-medium", getTitleColor())}>{title}</h4>
      <p className={cn("text-sm mt-1", getDescriptionColor())}>{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className={cn(
            "text-sm font-medium mt-2 hover:underline",
            getTitleColor()
          )}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

interface TopDocumentItemProps {
  rank: number;
  title: string;
  type: string;
  views: number;
  createdAt: string;
  onClick?: () => void;
}

export function TopDocumentItem({ 
  rank, 
  title, 
  type, 
  views, 
  createdAt, 
  onClick 
}: TopDocumentItemProps) {
  return (
    <div 
      className={cn(
        "flex items-center justify-between p-4 border rounded-lg transition-colors",
        onClick && "cursor-pointer hover:bg-muted/50"
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
          {rank}
        </div>
        <div>
          <h4 className="font-medium truncate max-w-[200px]">{title}</h4>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary">{type}</Badge>
            <span>Created {new Date(createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-bold text-lg">{views}</div>
        <div className="text-sm text-muted-foreground">views</div>
      </div>
    </div>
  );
}
