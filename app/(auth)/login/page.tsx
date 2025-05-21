"use client";

import { LoginForm } from "@/app/components/login-form";
import { motion } from "framer-motion";
import { Leaf } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center p-4">
      <div className="relative w-full max-w-5xl mx-auto">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/20 to-green-100/20 dark:from-green-950/20 dark:to-green-900/20 backdrop-blur-[2px]" />

        <div className="relative grid md:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden md:block text-center md:text-left"
          >
            <div className="space-y-6">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-block"
              >
                <span className="inline-flex items-center px-4 py-2 rounded-full bg-green-100/80 dark:bg-green-900/80 text-green-700 dark:text-green-300 text-sm font-medium backdrop-blur-sm">
                  <Leaf className="w-4 h-4 mr-2" />
                  Agricultural Innovation
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-4xl md:text-5xl font-bold tracking-tight text-foreground"
              >
                Welcome to{" "}
                <span className="text-green-600 dark:text-green-400">
                  Chaya
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-xl text-muted-foreground"
              >
                Sign in to access your agricultural management dashboard
              </motion.p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <LoginForm />
          </motion.div>
        </div>
      </div>
    </main>
  );
}
