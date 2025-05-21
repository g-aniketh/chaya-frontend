"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Package,
  BarChart,
  LogOut,
  Leaf,
  ChevronLeft,
  Menu,
  Server,
  Loader2,
  Bug,
} from "lucide-react";
import { useAuth } from "@/app/providers/auth-provider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

const baseNavItems = [
  { title: "Dashboard", href: "/dashboard", icon: Home, adminOnly: true },
  { title: "Farmer Details", href: "/farmers", icon: Leaf, adminOnly: false },
  {
    title: "Procurement",
    href: "/procurements",
    icon: Package,
    adminOnly: false,
  },
  {
    title: "Processing Batches",
    href: "/processing-batches",
    icon: BarChart,
    adminOnly: false,
  },
];

const adminNavItems = [
  { title: "Staff Management", href: "/staff", icon: Users, adminOnly: true },
];

const MIN_WIDTH = 60;
const MAX_WIDTH = 280;
const DEFAULT_WIDTH = 200;

export function AppSidebar(
  props: Readonly<React.HTMLAttributes<HTMLDivElement>>
) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);
  const [sidebarWidth, setSidebarWidth] = React.useState(DEFAULT_WIDTH);
  const [isResizing, setIsResizing] = React.useState(false);
  const [healthStatus, setHealthStatus] = React.useState<
    "healthy" | "unhealthy" | "loading"
  >("loading");
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [activeButton, setActiveButton] = React.useState<string | null>(null);

  const isRouteActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const navItems = React.useMemo(() => {
    let items = [...baseNavItems];
    if (user?.role === "ADMIN") {
      items = items.concat(adminNavItems);
    }
    items = items.filter(
      (item) => !item.adminOnly || (item.adminOnly && user?.role === "ADMIN")
    );
    return items;
  }, [user]);

  React.useEffect(() => {
    try {
      const storedCollapsed = localStorage.getItem("sidebar-collapsed");
      const storedWidth = localStorage.getItem("sidebar-width");

      setCollapsed(storedCollapsed ? JSON.parse(storedCollapsed) : false);
      setSidebarWidth(
        storedWidth
          ? Math.max(MIN_WIDTH, Math.min(JSON.parse(storedWidth), MAX_WIDTH))
          : DEFAULT_WIDTH
      );
    } catch (error) {
      console.error("Error loading sidebar state:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  React.useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("sidebar-collapsed", JSON.stringify(collapsed));
    localStorage.setItem("sidebar-width", JSON.stringify(sidebarWidth));
  }, [collapsed, sidebarWidth, isLoaded]);

  const handleToggleCollapse = React.useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      let newWidth = e.clientX;
      newWidth = Math.max(MIN_WIDTH, Math.min(newWidth, MAX_WIDTH));
      setSidebarWidth(newWidth);

      if (newWidth < MIN_WIDTH + 20 && !collapsed) {
        setCollapsed(true);
      } else if (newWidth > MIN_WIDTH + 50 && collapsed) {
        setCollapsed(false);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = "";
    };

    if (isResizing) {
      document.body.style.cursor = "col-resize";
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, collapsed]);

  const checkHealth = async () => {
    try {
      setHealthStatus("loading");
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/health`,
        {
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error("Health check failed");
      const data = await response.json();

      if (!data.database.success) {
        setHealthStatus("unhealthy");
        toast.error("Critical Error: Database Unavailable", {
          description:
            "Please contact the developer immediately. No operations will work until this is resolved.",
          duration: 10000,
        });
        return;
      }

      if (!data.redis.success) {
        setHealthStatus("unhealthy");
        toast.warning("Performance Warning: Redis Unavailable", {
          description:
            "Database calls may be slower than usual. The application will continue to function but with reduced performance.",
          duration: 5000,
        });
        return;
      }

      setHealthStatus("healthy");
      toast.success("Server Status", {
        description: "All systems are operational and running smoothly!",
        duration: 3000,
      });
    } catch (err) {
      setHealthStatus("unhealthy");
      if (err instanceof Error && err.name === "AbortError") {
        toast.error("Server Response Timeout", {
          description:
            "The server is taking longer than expected to respond. This might be due to cold start or high load.",
          duration: 5000,
        });
      } else {
        toast.error("Server Connection Failed", {
          description:
            "Unable to connect to the server. Please check your internet connection or try again later.",
          duration: 5000,
        });
      }
    }
  };

  React.useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 120000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
    } catch (error: unknown) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleNavClick = (href: string) => {
    setActiveButton(href);
    setTimeout(() => {
      setActiveButton(null);
    }, 2000);
  };

  const handleReportIssue = () => {
    window.open(
      "https://github.com/fyzanshaik/chaya-frontend/issues/new",
      "_blank"
    );
  };

  const getHealthStatusMessage = (status: typeof healthStatus) => {
    switch (status) {
      case "healthy":
        return "Server is healthy";
      case "unhealthy":
        return "Server is unhealthy";
      default:
        return "Checking server status...";
    }
  };

  const getServerIconClass = (status: typeof healthStatus) => {
    switch (status) {
      case "healthy":
        return "text-green-500";
      case "unhealthy":
        return "text-red-500";
      default:
        return "text-yellow-500 animate-pulse";
    }
  };

  if (!isLoaded || !user) {
    return (
      <div
        className="flex flex-col h-full bg-green-50/90 border-r border-green-200 shadow-md"
        style={{ width: MIN_WIDTH }}
      >
        <div className="flex items-center justify-center h-16 border-b border-green-200">
          <div className="w-8 h-8 bg-green-200 rounded-full animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-green-50/50 shadow-sm relative group transition-all duration-300 border-r border-black",
        inter.className
      )}
      style={{ width: collapsed ? MIN_WIDTH : sidebarWidth }}
      {...props}
    >
      <div className="flex items-center justify-between h-16 border-b border-green-100/50 px-3">
        <div className="flex items-center gap-2">
          {!collapsed && (
            <>
              <h2 className="text-xl font-bold text-green-600 whitespace-nowrap tracking-tight">
                Chaya
              </h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 relative"
                onClick={() => checkHealth()}
                title={getHealthStatusMessage(healthStatus)}
              >
                <div className="relative">
                  <Server
                    className={cn(
                      "h-4 w-4 relative z-10",
                      getServerIconClass(healthStatus)
                    )}
                  />
                  {healthStatus === "healthy" && (
                    <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
                  )}
                </div>
              </Button>
              {!collapsed && healthStatus === "healthy" && (
                <span className="text-xs text-black-500/70 ml-1 tracking-wide">
                  Server is running!
                </span>
              )}
            </>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleCollapse}
          className="h-8 w-8 hover:bg-green-100/30"
        >
          {collapsed ? (
            <Menu className="h-4 w-4 text-green-500" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-green-500" />
          )}
        </Button>
      </div>

      <div className="flex flex-1 flex-col justify-between overflow-hidden">
        <nav className="p-1.5 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            if (!item.adminOnly || (item.adminOnly && user?.role === "ADMIN")) {
              const active = isRouteActive(item.href);
              const isLoading = activeButton === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className={cn(
                    "flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all duration-200 border border-transparent hover:border-green-200/50 cursor-pointer",
                    active
                      ? "bg-green-100/30 text-green-600 border-green-200/50"
                      : "text-gray-600 hover:text-green-600 hover:bg-green-50/30",
                    collapsed ? "justify-center px-2" : "",
                    isLoading ? "opacity-70" : ""
                  )}
                  title={collapsed ? item.title : undefined}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 flex-shrink-0 animate-spin" />
                  ) : (
                    <item.icon
                      className={cn(
                        "w-5 h-5 flex-shrink-0",
                        collapsed ? "mx-auto" : ""
                      )}
                    />
                  )}
                  {!collapsed && (
                    <span className="whitespace-nowrap transition-opacity duration-200 text-sm tracking-wide">
                      {item.title}
                    </span>
                  )}
                </Link>
              );
            }
            return null;
          })}
        </nav>

        <div className="flex flex-col gap-1.5 p-1.5 border-t border-green-100/50">
          <Button
            variant="ghost"
            onClick={handleReportIssue}
            className={cn(
              "w-full justify-start gap-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50/30 border border-transparent hover:border-blue-200/50 cursor-pointer",
              collapsed ? "justify-center px-2" : ""
            )}
            title={collapsed ? "Report Issue" : undefined}
          >
            <Bug
              className={cn(
                "w-5 h-5 flex-shrink-0",
                collapsed ? "mx-auto" : ""
              )}
            />
            {!collapsed && (
              <span className="whitespace-nowrap transition-opacity duration-200 text-sm tracking-wide">
                Report Issue
              </span>
            )}
          </Button>

          <Button
            variant="ghost"
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className={cn(
              "w-full justify-start gap-2 text-red-400 hover:text-red-500 hover:bg-red-50/30 border border-transparent hover:border-red-200/50 cursor-pointer",
              collapsed ? "justify-center px-2" : "",
              isLoggingOut ? "opacity-70" : ""
            )}
            title={collapsed ? "Log Out" : undefined}
          >
            {isLoggingOut ? (
              <Loader2 className="w-5 h-5 flex-shrink-0 animate-spin" />
            ) : (
              <LogOut
                className={cn(
                  "w-5 h-5 flex-shrink-0",
                  collapsed ? "mx-auto" : ""
                )}
              />
            )}
            {!collapsed && (
              <span className="whitespace-nowrap transition-opacity duration-200 text-sm tracking-wide">
                Log Out
              </span>
            )}
          </Button>
        </div>
      </div>

      <Button
        aria-label="Resize sidebar"
        tabIndex={0}
        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize bg-green-100/50 hover:w-2 hover:bg-green-200/50 active:w-3 active:bg-green-300/50 transition-all duration-200 border-0"
        onMouseDown={startResize}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            e.preventDefault();
            const newWidth =
              e.key === "ArrowLeft" ? sidebarWidth - 10 : sidebarWidth + 10;
            setSidebarWidth(Math.max(MIN_WIDTH, Math.min(newWidth, MAX_WIDTH)));
          }
        }}
      />
    </div>
  );
}
