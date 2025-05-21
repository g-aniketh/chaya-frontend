"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface HealthStatus {
  database: {
    success: boolean;
    details: {
      id: number;
      createdAt: string;
      updatedAt: string;
    };
  };
  redis: {
    success: boolean;
    details: {
      id: number;
      createdAt: string;
      updatedAt: string;
    };
  };
  message: string;
  timestamp: string;
}

export function HealthStatus() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkHealth = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/api/health`
      );
      if (!response.ok) throw new Error("Health check failed");
      const data = await response.json();
      setHealth(data);
      setError(false);
    } catch (error: unknown) {
      console.error("Health check failed:", error);
      setError(true);
      setHealth(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 120000); // 2 minutes
    return () => clearInterval(interval);
  }, []);

  const getStatusMessage = () => {
    if (isLoading) return "Checking server status...";
    if (error) return "Server may have cold start";
    if (!health) return "Checking server status...";

    const dbStatus = health.database.success ? "DB running" : "DB error";
    const redisStatus = health.redis.success ? "Redis running" : "Redis error";

    if (health.database.success && health.redis.success) {
      return "All systems running";
    }
    return `${dbStatus}, ${redisStatus}`;
  };

  return (
    <div className="flex items-center gap-2">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="w-2 h-2 rounded-full bg-yellow-500"
          >
            <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={cn(
              "w-2 h-2 rounded-full",
              error ? "bg-red-500" : "bg-green-500",
              !error && "animate-pulse"
            )}
          />
        )}
      </AnimatePresence>
      <span className="text-xs text-muted-foreground">
        {getStatusMessage()}
      </span>
    </div>
  );
}
