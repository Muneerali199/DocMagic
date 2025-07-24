import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, Star } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DocumentCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  className?: string;
}

export function DocumentCard({
  title,
  description,
  icon,
  href,
  className,
}: DocumentCardProps) {
  // Assign different color themes to different card types
  const getCardTheme = (title: string) => {
    switch (title.toLowerCase()) {
      case 'resume':
        return {
          cardClass: 'card-coral hover-coral',
          gradientClass: 'sunset-gradient',
          glowClass: 'sunset-glow'
        };
      case 'presentation':
        return {
          cardClass: 'card-sky hover-sky',
          gradientClass: 'ocean-gradient',
          glowClass: 'ocean-glow'
        };
      case 'cv':
        return {
          cardClass: 'card-mint hover-mint',
          gradientClass: 'forest-gradient',
          glowClass: 'bolt-glow'
        };
      case 'letter':
        return {
          cardClass: 'card-lavender hover-lavender',
          gradientClass: 'cosmic-gradient',
          glowClass: 'sunset-glow'
        };
      default:
        return {
          cardClass: 'glass-effect',
          gradientClass: 'bolt-gradient',
          glowClass: 'bolt-glow'
        };
    }
  };

  const theme = getCardTheme(title);

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-500 hover:shadow-2xl group relative border-0 hover:scale-105 h-full",
        theme.cardClass,
        `hover:${theme.glowClass}`,
        className
      )}
    >
      {/* Animated gradient border effect */}
      <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500 rounded-lg", theme.gradientClass)} style={{animation: 'gradient-shift 3s ease infinite'}}></div>
      
      {/* Enhanced shimmer effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 shimmer"></div>
      </div>
      
      {/* Floating particles effect */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
      </div>
      <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <Star className="h-3 w-3 text-blue-500 animate-spin" style={{animationDuration: '3s'}} />
      </div>
      
      <CardHeader className="relative z-10 pb-3 sm:pb-4 p-4 sm:p-6">
        <div className="relative">
          <div className={cn("h-12 w-12 sm:h-14 sm:w-14 rounded-xl flex items-center justify-center text-white mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 relative", theme.gradientClass)}>
            {icon}
            {/* Icon glow effect */}
            <div className={cn("absolute inset-0 rounded-xl opacity-0 group-hover:opacity-50 blur-md transition-opacity duration-300", theme.gradientClass)}></div>
          </div>
          
          {/* Magic wand effect on hover */}
          <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <Zap className="h-4 w-4 text-yellow-500 animate-bounce" />
          </div>
        </div>
        
        <CardTitle className="text-lg sm:text-xl group-hover:bolt-gradient-text transition-all duration-300 font-bold">
          {title}
        </CardTitle>
        <CardDescription className="text-sm sm:text-base text-muted-foreground group-hover:text-foreground/80 transition-colors line-clamp-3 leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="relative z-10 p-4 sm:p-6 pt-0">
        <div className="h-24 sm:h-32 rounded-lg bg-gradient-to-br from-muted/50 to-muted/80 flex items-center justify-center transition-all duration-500 border border-border/50 relative overflow-hidden group-hover:border-2" style={{animation: 'rainbow-border 6s linear infinite'}}>
          {/* Dynamic background based on card theme */}
          <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500", theme.gradientClass)}></div>
          {/* Preview content with enhanced effects */}
          <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors relative z-10">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 group-hover:text-yellow-500 transition-colors" style={{animation: 'sparkle 2s ease-in-out infinite'}} />
            <span className="font-medium text-sm sm:text-base">AI Preview</span>
            <Star className="h-4 w-4 sm:h-5 sm:w-5 group-hover:text-blue-500 transition-colors" style={{animation: 'color-dance 4s ease-in-out infinite'}} />
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="relative z-10 p-4 sm:p-6 pt-0">
        <Button 
          asChild 
          className={cn("w-full text-white font-semibold hover:scale-105 transition-all duration-300 text-sm sm:text-base h-9 sm:h-10 relative overflow-hidden", theme.gradientClass, `group-hover:${theme.glowClass}`)}
        >
          <Link href={href} className="flex items-center justify-center gap-2 relative z-10">
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 animate-pulse" />
            Create Now
            <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
            
            {/* Button shimmer effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            </div>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}