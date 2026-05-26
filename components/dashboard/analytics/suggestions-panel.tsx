"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Lightbulb, 
  ArrowRight, 
  AlertCircle, 
  TrendingUp, 
  Zap,
  Info
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const priorityConfig = {
  high: { color: "text-red-500 bg-red-500/10 border-red-500/20", icon: AlertCircle },
  medium: { color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20", icon: Zap },
  low: { color: "text-blue-500 bg-blue-500/10 border-blue-500/20", icon: Info }
};

/**
 * Panel displaying AI-free heuristic suggestions for document improvement
 */
export function SuggestionsPanel({ suggestions }: { suggestions: any[] }) {
  if (!suggestions || suggestions.length === 0) {
    return (
      <Card className="p-12 glass-effect flex flex-col items-center justify-center text-center border border-border/40">
        <div className="p-4 rounded-full bg-primary/10 mb-4 animate-pulse">
          <TrendingUp className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-bold mb-2">You're doing great!</h3>
        <p className="text-muted-foreground max-w-xs">
          No improvement suggestions available yet. Keep sharing and refining your document to unlock more insights.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {suggestions.map((suggestion, index) => {
        const config = priorityConfig[suggestion.priority as keyof typeof priorityConfig] || priorityConfig.medium;
        const Icon = config.icon;
        
        return (
          <motion.div
            key={suggestion.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 glass-effect border border-border/40 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all h-full flex flex-col group">
              <div className="flex items-start justify-between mb-5">
                <Badge variant="outline" className={`capitalize flex items-center gap-1.5 px-2 py-1 ${config.color}`}>
                  <Icon className="h-3 w-3" />
                  {suggestion.priority} Priority
                </Badge>
                <Badge variant="secondary" className="capitalize text-[10px] font-bold tracking-wider">
                  {suggestion.category}
                </Badge>
              </div>
              
              <h4 className="text-xl font-bold mb-3 flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-yellow-500/10 group-hover:bg-yellow-500/20 transition-colors">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                </div>
                {suggestion.title}
              </h4>
              <p className="text-sm text-muted-foreground mb-6 flex-1 leading-relaxed">
                {suggestion.description}
              </p>
              
              {suggestion.action_label && (
                <Button asChild className="w-full group/btn relative overflow-hidden h-11">
                  <Link href={suggestion.action_href || "#"}>
                    <span className="relative z-10 flex items-center justify-center font-bold">
                      {suggestion.action_label}
                      <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                </Button>
              )}
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
