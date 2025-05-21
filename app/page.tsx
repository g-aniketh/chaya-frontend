"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Inter } from "next/font/google";
import { ArrowRight, Leaf, Package, Settings } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const renderAuthButton = () => {
    if (isAuthenticated === null) {
      return (
        <div className="h-12 w-40">
          <div className="animate-pulse bg-muted h-full rounded-full" />
        </div>
      );
    }

    if (error) {
      return <div className="text-destructive mb-4">{error}</div>;
    }

    return (
      <div className="flex flex-col items-center gap-4">
        {isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/50 border border-green-200 dark:border-green-800">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                You are logged in!
              </span>
            </div>
          </motion.div>
        )}
        <Link href={isAuthenticated ? "/dashboard" : "/login"} passHref>
          <Button
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            {isAuthenticated ? "Go to Dashboard" : "Get Started"}
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
    );
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/current-user");
        if (response.status === 401) {
          setIsAuthenticated(false);
          setError(null);
          return;
        }
        if (!response.ok) {
          throw new Error("Authentication check failed");
        }
        setIsAuthenticated(true);
        setError(null);
      } catch (err) {
        setIsAuthenticated(false);
        setError(err instanceof Error ? err.message : "Authentication failed");
      }
    };
    checkAuth();
  }, []);

  return (
    <div className={cn("min-h-screen bg-background/50", inter.className)}>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 to-green-100/30 dark:from-green-950/30 dark:to-green-900/30 backdrop-blur-sm" />
        <div className="container relative mx-auto px-4 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-block mb-4"
            >
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-sm font-medium">
                <Leaf className="w-4 h-4 mr-2" />
                Agricultural Innovation
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-5xl font-bold tracking-tight sm:text-7xl text-foreground mb-6"
            >
              Welcome to{" "}
              <span className="text-green-600 dark:text-green-400">Chaya</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto"
            >
              Empowering farmers and revolutionizing agricultural management
              through innovative technology
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              {renderAuthButton()}
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Comprehensive Agricultural Solutions
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform provides end-to-end solutions for modern agricultural
              management
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Farmer Management",
                description:
                  "Efficiently manage farmer profiles and their agricultural activities with our comprehensive dashboard",
                icon: (
                  <Leaf className="w-8 h-8 text-green-600 dark:text-green-400" />
                ),
                features: [
                  "Profile Management",
                  "Activity Tracking",
                  "Document Storage",
                ],
              },
              {
                title: "Procurement Tracking",
                description:
                  "Streamline the procurement process and track deliveries with real-time updates",
                icon: (
                  <Package className="w-8 h-8 text-green-600 dark:text-green-400" />
                ),
                features: [
                  "Real-time Updates",
                  "Delivery Tracking",
                  "Inventory Management",
                ],
              },
              {
                title: "Processing Batches",
                description:
                  "Monitor and manage processing batches with our advanced tracking system",
                icon: (
                  <Settings className="w-8 h-8 text-green-600 dark:text-green-400" />
                ),
                features: [
                  "Batch Tracking",
                  "Quality Control",
                  "Process Optimization",
                ],
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                className="bg-card text-card-foreground p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100 dark:border-green-900"
              >
                <div className="mb-6">{feature.icon}</div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.features.map((item) => (
                    <li
                      key={item}
                      className="flex items-center text-sm text-muted-foreground"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px]" />
    </div>
  );
}
