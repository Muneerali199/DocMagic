"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { File as FileIcon, FileText, Presentation as LayoutPresentation, Mail as MailIcon, Menu, LogOut, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/components/auth-provider";
import {
  Sheet,
  SheetContent,
  SheetTrigger
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

export function SiteHeader() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full nav-professional px-4 sm:px-6 lg:px-10">
      <div className="container flex h-14 sm:h-16 items-center justify-between">
        <div className="flex items-center gap-4 sm:gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <FileText className="h-6 w-6 sm:h-7 sm:w-7 bolt-gradient-text group-hover:scale-110 transition-transform duration-300" />
              <Sparkles className="absolute -top-1 -right-1 h-2 w-2 sm:h-3 sm:w-3 text-yellow-500 animate-pulse" />
            </div>
            <span className="font-bold text-lg sm:text-xl bolt-gradient-text hidden xs:block">DocMagic</span>
          </Link>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden glass-effect border-yellow-400/30 h-8 w-8 sm:h-9 sm:w-9">
                <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="professional-card border-r w-[280px] sm:w-[320px]">
              <div className="flex flex-col gap-6 pt-6">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="relative">
                    <FileText className="h-6 w-6 bolt-gradient-text" />
                    <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-500" />
                  </div>
                  <span className="font-bold text-xl bolt-gradient-text">DocMagic</span>
                </Link>
                <nav className="flex flex-col gap-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "text-lg font-medium transition-colors hover:bolt-gradient-text flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50",
                        pathname === item.href ? "bolt-gradient-text bg-muted/30" : "text-muted-foreground"
                      )}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
          
          <nav className="hidden md:flex items-center gap-4 lg:gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-all duration-300 hover:bolt-gradient-text hover:scale-105 flex items-center gap-1",
                  pathname === item.href ? "bolt-gradient-text" : "text-muted-foreground"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8 ring-2 ring-yellow-400/20 hover:ring-yellow-400/40 transition-all">
                    <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.name || user.email} />
                    <AvatarFallback className="bolt-gradient text-white font-semibold text-xs">
                      {(user.user_metadata?.name?.[0] || user.email?.[0] || 'U').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="professional-card">
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="hover:bg-red-50 hover:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild className="bolt-gradient text-white font-semibold hover:scale-105 transition-all duration-300 text-xs sm:text-sm px-3 sm:px-4 h-8 sm:h-9">
              <Link href="/auth/signin" className="flex items-center gap-1">
                <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Sign In</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

const navItems = [
  {
    href: "/resume",
    label: "Resume",
    icon: <FileIcon className="h-4 w-4" />
  },
  {
    href: "/presentation", 
    label: "Presentation",
    icon: <LayoutPresentation className="h-4 w-4" />
  },
  {
    href: "/letter",
    label: "Letter", 
    icon: <MailIcon className="h-4 w-4" />
  },
  {
    href: "/about",
    label: "About", 
    icon: <Sparkles className="h-4 w-4" />
  }
];