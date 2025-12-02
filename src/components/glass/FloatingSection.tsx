"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface FloatingSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function FloatingSection({
  children,
  className,
  delay = 0,
}: FloatingSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      className={cn("floating", className)}
    >
      {children}
    </motion.div>
  );
}

