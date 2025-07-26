"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  File as FileIcon,
  FileText,
  Presentation as LayoutPresentation,
  Mail as MailIcon,
  Menu,
  LogOut,
  Sparkles,
  Zap,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/components/auth-provider";
import { TooltipWithShortcut } from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
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
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const handleNavClick = () => {
    setIsSheetOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full nav-professional px-2 xs:px-3 sm:px-6 lg:px-10">
      <div className="container flex h-14 sm:h-16 items-center justify-between px-0">
        <div className="flex items-center gap-2 xs:gap-3 sm:gap-6 md:gap-10 min-w-0">
          {/* Logo with tooltip for desktop only */}
          <TooltipWithShortcut
            content="Return to homepage"
            disabled={typeof window !== "undefined" && window.innerWidth < 768}
          >
            <Link
              href="/"
              className="flex items-center space-x-2 group min-w-0"
            >
              <div className="relative">
                <FileText className="h-6 w-6 sm:h-7 sm:w-7 bolt-gradient-text group-hover:scale-110 transition-transform duration-300" />
                <Sparkles className="absolute -top-1 -right-1 h-2 w-2 sm:h-3 sm:w-3 text-yellow-500 animate-pulse" />
              </div>
              <span className="font-bold text-lg sm:text-xl bolt-gradient-text hidden xs:block truncate max-w-[80px] sm:max-w-none">
                DocMagic
              </span>
            </Link>
          </TooltipWithShortcut>

          {/* Mobile Navigation Sheet */}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="md:hidden bg-background/95 backdrop-blur-sm border-border/40 hover:bg-accent hover:text-accent-foreground h-8 w-8 sm:h-9 sm:w-9 transition-all duration-200"
                aria-label="Open navigation menu"
              >
                <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[280px] sm:w-[320px] bg-background/95 backdrop-blur-xl border-border/50"
            >
              <SheetHeader className="text-left pb-4 border-b border-border/20">
                <SheetTitle className="flex items-center gap-2 text-lg">
                  <div className="relative">
                    <FileText className="h-5 w-5 bolt-gradient-text" />
                    <Sparkles className="absolute -top-0.5 -right-0.5 h-2 w-2 text-yellow-500 animate-pulse" />
                  </div>
                  DocMagic
                </SheetTitle>
                <SheetDescription className="text-sm text-muted-foreground">
                  Access all document creation tools
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Navigation Items */}
                <nav className="space-y-1">
                  {navItems.map((item) => (
                    <SheetClose asChild key={item.href}>
                      <Link
                        href={item.href}
                        onClick={handleNavClick}
                        className={cn(
                          "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-accent/50 hover:text-accent-foreground group w-full",
                          pathname === item.href
                            ? "bg-accent text-accent-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <span
                          className={cn(
                            "transition-colors duration-200",
                            pathname === item.href
                              ? "text-yellow-600"
                              : "group-hover:text-yellow-500"
                          )}
                        >
                          {item.icon}
                        </span>
                        <span className="font-medium">{item.label}</span>
                        {pathname === item.href && (
                          <div className="ml-auto">
                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                          </div>
                        )}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>

                {/* User Section in Mobile */}
                {user && (
                  <div className="pt-4 border-t border-border/20">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/20">
                      <Avatar className="h-10 w-10 ring-2 ring-yellow-400/30">
                        <AvatarImage src={user.user_metadata?.avatar_url} />
                        <AvatarFallback className="bolt-gradient text-white text-sm font-semibold">
                          {(
                            user.user_metadata?.name?.[0] ||
                            user.email?.[0] ||
                            "U"
                          ).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {user.user_metadata?.name || "User"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1 mt-3">
                      <SheetClose asChild>
                        <Link
                          href="/settings"
                          className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-accent/50 hover:text-accent-foreground transition-colors w-full"
                        >
                          <Sparkles className="h-4 w-4 text-muted-foreground" />
                          Settings
                        </Link>
                      </SheetClose>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-red-50 hover:text-red-600 w-full justify-start transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                )}

                {/* Sign In Button for Mobile */}
                {!user && (
                  <div className="pt-4 border-t border-border/20">
                    <SheetClose asChild>
                      <Button
                        asChild
                        className="w-full bolt-gradient text-white font-semibold hover:scale-105 transition-all duration-300"
                      >
                        <Link
                          href="/auth/signin"
                          className="flex items-center gap-2"
                        >
                          <Zap className="h-4 w-4" />
                          Sign In to DocMagic
                        </Link>
                      </Button>
                    </SheetClose>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Desktop Navigation with Tooltips */}
          <nav className="hidden md:flex items-center gap-2 xs:gap-3 lg:gap-6 min-w-0">
            {navItems.map((item) => (
              <TooltipWithShortcut key={item.href} content={item.tooltip}>
                <Link
                  href={item.href}
                  className={cn(
                    "text-xs xs:text-sm font-medium transition-all duration-300 hover:bolt-gradient-text hover:scale-105 flex items-center gap-1 truncate max-w-[70px] xs:max-w-none relative group",
                    pathname === item.href
                      ? "bolt-gradient-text"
                      : "text-muted-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "transition-transform duration-200",
                      "group-hover:scale-110"
                    )}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {pathname === item.href && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-yellow-500"></div>
                  )}
                </Link>
              </TooltipWithShortcut>
            ))}
          </nav>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-1 xs:gap-2">
          {/* Theme Toggle with Tooltip */}
          <TooltipWithShortcut content="Switch between light and dark theme">
            <ThemeToggle />
          </TooltipWithShortcut>

          {/* Desktop User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <TooltipWithShortcut content="View account settings and profile">
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full hidden md:flex"
                  >
                    <Avatar className="h-8 w-8 ring-2 ring-yellow-400/20 hover:ring-yellow-400/40 transition-all duration-200">
                      <AvatarImage
                        src={user.user_metadata?.avatar_url}
                        alt={user.user_metadata?.name || user.email}
                      />
                      <AvatarFallback className="bolt-gradient text-white font-semibold text-xs">
                        {(
                          user.user_metadata?.name?.[0] ||
                          user.email?.[0] ||
                          "U"
                        ).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </TooltipWithShortcut>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-background/95 backdrop-blur-xl border-border/50"
              >
                <div className="flex items-center gap-2 p-2 border-b border-border/20">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="bolt-gradient text-white text-xs">
                      {(
                        user.user_metadata?.name?.[0] ||
                        user.email?.[0] ||
                        "U"
                      ).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {user.user_metadata?.name || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/settings" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="hover:bg-red-50 hover:text-red-600 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            /* Desktop Sign In Button */
            <TooltipWithShortcut content="Sign in to save and manage your documents">
              <Button
                asChild
                className="bolt-gradient text-white font-semibold hover:scale-105 transition-all duration-300 text-xs xs:text-sm px-2 xs:px-3 sm:px-4 h-8 sm:h-9 hidden md:flex"
              >
                <Link href="/auth/signin" className="flex items-center gap-1">
                  <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Sign In</span>
                </Link>
              </Button>
            </TooltipWithShortcut>
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
    icon: <FileIcon className="h-4 w-4" />,
    tooltip: "Create professional resumes with AI assistance",
  },
  {
    href: "/presentation",
    label: "Presentation",
    icon: <LayoutPresentation className="h-4 w-4" />,
    tooltip: "Generate stunning slide presentations instantly",
  },
  {
    href: "/letter",
    label: "Letter",
    icon: <MailIcon className="h-4 w-4" />,
    tooltip: "Write professional letters and cover letters",
  },
  {
    href: "/templates",
    label: "Templates",
    icon: <FileText className="h-4 w-4" />
  },
  {
    href: "/about",
    label: "About",
    icon: <Sparkles className="h-4 w-4" />,
    tooltip: "Learn more about DocMagic and our features",
  },
  {
    href: "/pricing",
    label: "Pricing",
    icon: <DollarSign className="h-4 w-4" />,
    tooltip: "View pricing plans and upgrade options",
  },
];
