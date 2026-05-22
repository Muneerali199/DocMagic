"use client";

import { Card } from "@/components/ui/card";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format, subWeeks, startOfWeek, addDays, isSameDay } from "date-fns";

/**
 * GitHub-style activity heatmap for document interactions
 */
export function DocumentHeatmap({ data }: { data: any[] }) {
  const today = new Date();
  const weeks = 12;
  const startDate = startOfWeek(subWeeks(today, weeks - 1), { weekStartsOn: 1 }); // Start on Monday
  
  const calendar: Date[][] = [];
  for (let w = 0; w < weeks; w++) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(addDays(startDate, w * 7 + d));
    }
    calendar.push(week);
  }

  const getIntensity = (count: number) => {
    if (count === 0) return "bg-white/5";
    if (count < 3) return "bg-primary/30";
    if (count < 6) return "bg-primary/50";
    if (count < 10) return "bg-primary/70";
    return "bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]";
  };

  const getCountForDate = (date: Date) => {
    const found = data?.find(d => isSameDay(new Date(d.date), date));
    return found ? found.count : 0;
  };

  return (
    <Card className="p-6 glass-effect border border-border/40 overflow-x-auto">
      <div className="flex items-center justify-between mb-6 min-w-[600px]">
        <div>
          <h3 className="text-lg font-bold">Activity Intensity</h3>
          <p className="text-sm text-muted-foreground">Document engagement over the last 12 weeks</p>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-[2px] bg-white/5" />
            <div className="w-3 h-3 rounded-[2px] bg-primary/30" />
            <div className="w-3 h-3 rounded-[2px] bg-primary/50" />
            <div className="w-3 h-3 rounded-[2px] bg-primary/70" />
            <div className="w-3 h-3 rounded-[2px] bg-primary" />
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="flex gap-3 min-w-[600px] justify-center lg:justify-start">
        <div className="grid grid-rows-7 gap-1.5 pr-2 text-[10px] text-muted-foreground pt-1">
          <span className="h-3 flex items-center">Mon</span>
          <span className="h-3" />
          <span className="h-3 flex items-center">Wed</span>
          <span className="h-3" />
          <span className="h-3 flex items-center">Fri</span>
          <span className="h-3" />
          <span className="h-3" />
        </div>
        
        <div className="flex gap-1.5">
          <TooltipProvider delayDuration={0}>
            {calendar.map((week, wIdx) => (
              <div key={wIdx} className="grid grid-rows-7 gap-1.5">
                {week.map((date, dIdx) => {
                  const count = getCountForDate(date);
                  // Hide dates in the future
                  if (date > today) return <div key={dIdx} className="w-3.5 h-3.5" />;
                  
                  return (
                    <Tooltip key={dIdx}>
                      <TooltipTrigger asChild>
                        <div 
                          className={`w-3.5 h-3.5 rounded-[2px] transition-all hover:scale-125 cursor-pointer hover:z-20 ${getIntensity(count)}`}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="glass-effect border-border/40">
                        <p className="text-[10px] font-bold">
                          <span className="text-primary">{count}</span> events
                          <span className="mx-1 text-muted-foreground">•</span> 
                          {format(date, 'MMM dd, yyyy')}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            ))}
          </TooltipProvider>
        </div>
      </div>
      
      {/* Month labels */}
      <div className="flex gap-1.5 pl-[45px] mt-2 min-w-[600px]">
        {calendar.map((week, wIdx) => {
          const firstDayOfWeek = week[0];
          // Show month label if it's the first week of the month or first week shown
          if (wIdx === 0 || firstDayOfWeek.getDate() <= 7) {
            return (
              <div key={wIdx} className="w-[19px] text-[10px] text-muted-foreground">
                {format(firstDayOfWeek, 'MMM')}
              </div>
            );
          }
          return <div key={wIdx} className="w-[19px]" />;
        })}
      </div>
    </Card>
  );
}
