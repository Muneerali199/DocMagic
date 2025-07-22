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
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-500 hover:shadow-2xl group relative border-0 glass-effect hover:scale-105 h-full",
        "hover:bolt-glow",
        className
      )}
    >
      {/* Animated gradient border effect */}
      <div className="absolute inset-0 bolt-gradient opacity-0 group-hover:opacity-30 transition-opacity duration-500 rounded-lg"></div>
      
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
          <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bolt-gradient flex items-center justify-center text-white mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 relative">
            {icon}
            {/* Icon glow effect */}
            <div className="absolute inset-0 bolt-gradient rounded-xl opacity-0 group-hover:opacity-50 blur-md transition-opacity duration-300"></div>
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
        <div className="h-24 sm:h-32 rounded-lg bg-gradient-to-br from-muted/50 to-muted/80 flex items-center justify-center group-hover:from-yellow-50 group-hover:to-blue-50 transition-all duration-500 border border-border/50 group-hover:border-yellow-400/30 relative overflow-hidden">
          {/* Preview content with enhanced effects */}
          <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors relative z-10">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 group-hover:text-yellow-500 transition-colors animate-pulse" />
            <span className="font-medium text-sm sm:text-base group-hover:text-black">AI Preview</span>
            <Star className="h-4 w-4 sm:h-5 sm:w-5 group-hover:text-blue-500 transition-colors" />
          </div>
          
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500">
            <div className="w-full h-full bg-gradient-to-r from-yellow-400/20 via-blue-400/20 to-purple-400/20 animate-pulse"></div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="relative z-10 p-4 sm:p-6 pt-0">
        <Button 
          asChild 
          className="w-full bolt-gradient text-white font-semibold hover:scale-105 transition-all duration-300 group-hover:bolt-glow text-sm sm:text-base h-9 sm:h-10 relative overflow-hidden"
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