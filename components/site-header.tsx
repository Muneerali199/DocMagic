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
  Workflow,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { PWAInstallButton } from "@/components/pwa-install-button";
import { SimpleThemeToggle } from "@/components/simple-theme-toggle";
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

function getInitials(user: any) {
  return (
    user?.user_metadata?.name?.[0] ||
    user?.email?.[0] ||
    "U"
  ).toUpperCase();
}

export function SiteHeader() {
  const pathname = usePathname();
  const { user, signOut, loading } = useAuth();
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

    <header className="sticky top-0 z-50 w-full nav-professional">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          <div className="flex items-center gap-4 lg:gap-8">
          {/* Logo with tooltip for desktop only */ }
          {/* TooltipWithShortcut 
            content="Return to homepage"
            disabled={typeof window !== "undefined" && window.innerWidth < 1536}*/}
          
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
          {/* </TooltipWithShortcut> */}

          {/* Mobile Navigation Sheet */}
          {/* <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>

    <header className="nav-professional sticky top-0 z-50 w-full border-b border-border/40 bg-gray-900 dark:bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-gray-100/90">
      <div className="nav-professional container flex h-16 items-center justify-between px-4">
        {/* Logo and Mobile Menu */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center space-x-2 group"
            aria-label="DocMagic Home"
          >
            <div className="relative flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />
              <Sparkles className="absolute -top-1 -right-1 h-2 w-2 text-yellow-500 animate-pulse" />
            </div>
            <span className="font-bold text-lg text-foreground hidden sm:block">
              DocMagic
            </span>
          </Link>

          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>

            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"

                className="2xl:hidden bg-background/95 backdrop-blur-sm border-border/40 hover:bg-accent hover:text-accent-foreground h-8 w-8 sm:h-9 sm:w-9 transition-all duration-200"

             className="md:hidden h-9 w-9"

                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[300px]">
              <SheetHeader className="text-left pb-4">
                <SheetTitle className="flex items-center gap-2 text-lg">
                  <div className="relative">
                    <FileText className="h-5 w-5 text-primary" />
                    <Sparkles className="absolute -top-0.5 -right-0.5 h-2 w-2 text-yellow-500 animate-pulse" />
                  </div>
                  <span className="font-bold">DocMagic</span>
                </SheetTitle>
                <SheetDescription>
                  Your document creation workspace
                </SheetDescription>
              </SheetHeader>


              <div className="mt-6 space-y-6">
                 Navigation Items 
                <nav className="space-y-1">

              <div className="mt-6 space-y-4">
                <nav className="space-y-1" aria-label="Mobile navigation">

                  {navItems.map((item) => (
                    <SheetClose asChild key={item.href}>
                      <Link
                        href={item.href}
                        onClick={handleNavClick}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                          pathname === item.href
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-accent/50 hover:text-accent-foreground"
                        )}
                        aria-current={pathname === item.href ? "page" : undefined}
                      >
                        <span className="text-muted-foreground">
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </Link>
                    </SheetClose>
                  ))}
                </nav>

                User Section in Mobile
                {user && (
                  <div className="pt-4 border-t border-border/20">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/20">
                      <Avatar className="h-10 w-10 ring-2 ring-yellow-400/30">


                {user ? (
                  <div className="pt-4 border-t border-border/20 space-y-4">
                    <div className="flex items-center gap-3 p-2 rounded-md bg-accent/20">
                      <Avatar className="h-9 w-9">

                        <AvatarImage src={user.user_metadata?.avatar_url} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(user)}
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

                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-600 hover:bg-red-50"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>

                )} 

                Sign In Button for Mobile 
                {!user && (

                ) : (

                  <div className="pt-4 border-t border-border/20">
                    <SheetClose asChild>
                      <Button asChild className="w-full" variant="default">
                        <Link href="/auth/signin">
                          <Zap className="mr-2 h-4 w-4" />
                          Sign In
                        </Link>
                      </Button>
                    </SheetClose>
                  </div>
                )}
              </div>
            </SheetContent>

          </Sheet> 

           Desktop Navigation with Tooltips */}
          <nav className="hidden 2xl:flex items-center gap-4 lg:gap-6 xl:gap-8">
            {navItems.map((item) => (
              <TooltipWithShortcut key={item.href} content={item.tooltip}>
                <Link
                  href={item.href}
                  className={cn(
                    "text-sm lg:text-base font-medium transition-all duration-300 hover:bolt-gradient-text hover:scale-105 flex items-center gap-2 relative group whitespace-nowrap",
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
                  <span className="hidden lg:inline">{item.label}</span>
                  {pathname === item.href && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-0.5 rounded-full bg-yellow-500"></div>
                  )}
                </Link>
              </TooltipWithShortcut>
            ))}
          </nav>
        </div>
      
          {/* Right Side Actionsx */}
          <div className="flex items-center gap-x-6">
            
         
          {/* PWA Install Button */}
          <TooltipWithShortcut content="Install DocMagic as an app on your device">

          </Sheet>
        </div>

        {/* Desktop Navigation - Hidden on mobile */}
        <nav
          className="hidden md:flex items-center gap-1"
          aria-label="Primary navigation"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2",
                pathname === item.href
                  ? "text-foreground bg-accent"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
              aria-current={pathname === item.href ? "page" : undefined}
              title={item.tooltip}
            >
              <span className="opacity-70">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          <TooltipWithShortcut content="Install app">

            <PWAInstallButton variant="ghost" size="sm" showText={false} />
          </TooltipWithShortcut>

          <SimpleThemeToggle />

          {loading ? (
            <div
              className="h-9 w-9 rounded-full bg-muted animate-pulse"
              aria-label="Loading user information"
            />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full"
                  aria-label="User menu"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(user)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-2 p-2">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback>{getInitials(user)}</AvatarFallback>
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
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="default" className="hidden md:flex">
              <Link href="/auth/signin">
                <Zap className="mr-2 h-4 w-4" />
                Sign In
              </Link>
            </Button>
          )}

           <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="2xl:hidden bg-background/95 backdrop-blur-sm border-border/40 hover:bg-accent hover:text-accent-foreground h-8 w-8 sm:h-9 sm:w-9 transition-all duration-200"
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
                          href="/profile"
                          className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-accent/50 hover:text-accent-foreground transition-colors w-full"
                        >
                          <User className="h-4 w-4 text-muted-foreground" />
                          Profile
                        </Link>
                      </SheetClose>
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
          </div>

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
    tooltip: "Create professional resumes",
  },
  {
    href: "/presentation",
    label: "Presentation",
    icon: <LayoutPresentation className="h-4 w-4" />,
    tooltip: "Generate slide presentations",
  },
  {
    href: "/cv",
    label: "CV",
    icon: <FileText className="h-4 w-4" />,
    tooltip: "Build curriculum vitae",
  },
  {
    href: "/letter",
    label: "Letter",
    icon: <MailIcon className="h-4 w-4" />,
    tooltip: "Write professional letters",
  },
  {
    href: "/diagram",
    label: "Diagram",
    icon: <Workflow className="h-4 w-4" />,
    tooltip: "Create flowcharts and diagrams",
  },
  {
    href: "/templates",
    label: "Templates",
    icon: <FileText className="h-4 w-4" />,
    tooltip: "Browse templates",
  },
  {
    href: "/pricing",
    label: "Pricing",
    icon: <DollarSign className="h-4 w-4" />,
    tooltip: "View pricing plans",
  },
];