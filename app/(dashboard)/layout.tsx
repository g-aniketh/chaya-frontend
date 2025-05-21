"use client";

import React from "react";
import { ThemeProvider } from "@/app/providers/theme-provider";
import { AuthProvider, useAuth } from "@/app/providers/auth-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "../components/layout/app-sidebar";
import { FarmersCacheProvider } from "./farmers/context/farmer-cache-context";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Toaster } from "sonner";

function AuthenticatedContent({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // if (loading) {
  //   return (
  //     <div className="flex h-screen w-screen items-center justify-center">
  //       Loading application...
  //     </div>
  //   );
  // }

  if (!user && pathname !== "/login") {
    return null;
  }

  if (
    user?.role === "STAFF" &&
    (pathname.startsWith("/staff") || pathname.startsWith("/dashboard"))
  ) {
    router.push("/farmers");
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <SidebarProvider>
        <AppSidebar className="h-screen" />
        <motion.div
          className="flex flex-col flex-1 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-1 flex-col p-4 overflow-auto">
            {children}
          </div>
        </motion.div>
      </SidebarProvider>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <FarmersCacheProvider>
          <AuthenticatedContent>{children}</AuthenticatedContent>
        </FarmersCacheProvider>
      </AuthProvider>
      <Toaster richColors closeButton />
    </ThemeProvider>
  );
}
