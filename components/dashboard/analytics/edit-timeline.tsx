"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { Clock, History, Save, RotateCcw, Tag } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Vertical timeline of document versions with restore capabilities
 */
export function EditTimeline({ versions }: { versions: any[] }) {
  if (!versions || versions.length === 0) {
    return (
      <div className="text-center py-12 glass-effect rounded-xl border border-border/40">
        <History className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
        <p className="text-muted-foreground">No edit history found for this document</p>
      </div>
    );
  }

  return (
    <div className="relative pl-8 space-y-8 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-primary/50 before:via-border/40 before:to-transparent">
      {versions.map((version, index) => (
        <motion.div 
          key={version.id || index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="relative"
        >
          <div className={`absolute -left-[31px] top-1 p-1.5 rounded-full bg-background border-2 z-10 ${version.is_auto_save ? 'border-border' : 'border-primary'}`}>
            {version.is_auto_save ? (
              <Clock className="h-3 w-3 text-muted-foreground" />
            ) : (
              <Save className="h-3 w-3 text-primary" />
            )}
          </div>
          
          <Card className="p-4 glass-effect border border-border/40 hover:border-primary/30 transition-all group">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground">Version {version.version_number}</span>
                {version.is_auto_save && (
                  <Badge variant="outline" className="text-[10px] bg-muted/50">Auto-save</Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground flex items-center gap-1 bg-secondary/50 px-2 py-0.5 rounded">
                <Clock className="h-3 w-3" />
                {version.created_at ? format(parseISO(version.created_at), 'MMM dd, HH:mm') : 'Unknown'}
              </span>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {version.changes_summary || "No description provided"}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {version.tags?.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1 text-[10px] px-1.5">
                    <Tag className="h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-muted-foreground">
                  By {version.created_by_name || "Unknown"}
                </span>
                <button className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1.5 bg-primary/10 px-2 py-1 rounded transition-colors">
                  <RotateCcw className="h-3.5 w-3.5" />
                  Restore
                </button>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
