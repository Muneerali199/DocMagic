"use client";

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { format, parseISO } from "date-fns";
import { Download, Share2, Copy, Printer, MessageSquare, Edit, Loader2 } from "lucide-react";

const eventIconMap: Record<string, any> = {
  download: Download,
  share: Share2,
  copy: Copy,
  print: Printer,
  feedback: MessageSquare,
  edit: Edit,
  view: Download // fallback
};

const eventColorMap: Record<string, string> = {
  download: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  share: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  copy: "bg-green-500/10 text-green-500 border-green-500/20",
  print: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  feedback: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  edit: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  view: "bg-primary/10 text-primary border-primary/20"
};

/**
 * Table showing recent engagement activity with icons and timestamps
 */
export function EngagementTable({
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
      <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-border/40 glass-effect">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage title="Could not load engagement data" message={error} />;
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title="No engagement data yet"
        description="Engagement events will appear here after viewers interact with this document."
        icon={<MessageSquare className="h-6 w-6" aria-hidden="true" />}
        className="glass-effect"
      />
    );
  }

  return (
    <div className="glass-effect rounded-xl border border-border/40 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-border/40 bg-white/5">
            <TableHead className="font-bold">Event Type</TableHead>
            <TableHead className="font-bold">Description</TableHead>
            <TableHead className="font-bold">Timestamp</TableHead>
            <TableHead className="text-right font-bold">Actor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => {
            const Icon = eventIconMap[item.type] || MessageSquare;
            return (
              <TableRow key={index} className="hover:bg-white/5 border-border/20 transition-colors">
                <TableCell>
                  <Badge variant="outline" className={`flex items-center w-fit gap-1.5 px-2 py-0.5 ${eventColorMap[item.type] || eventColorMap.view}`}>
                    <Icon className="h-3 w-3" />
                    <span className="capitalize">{item.type}</span>
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[300px] truncate font-medium">
                  {item.description}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {item.timestamp ? format(parseISO(item.timestamp), 'MMM dd, HH:mm') : 'Recently'}
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-sm bg-secondary/50 px-2 py-1 rounded-md">
                    {item.actor_name || 'Anonymous Viewer'}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
