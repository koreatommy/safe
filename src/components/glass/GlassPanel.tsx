"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function GlassPanel({ children, className, delay = 0 }: GlassPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={cn(
        "glass-panel p-6 md:p-8",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

