"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlowCapsuleButtonProps {
  children: ReactNode;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  href?: string;
  className?: string;
  variant?: "primary" | "secondary";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export function GlowCapsuleButton({
  children,
  onClick,
  href,
  className,
  variant = "primary",
  type = "button",
  disabled = false,
}: GlowCapsuleButtonProps) {
  const baseClasses = cn(
    "relative px-8 py-4 rounded-full",
    "backdrop-filter backdrop-blur-md",
    "transition-all duration-300",
    "font-medium text-base md:text-lg",
    disabled
      ? "opacity-50 cursor-not-allowed"
      : variant === "primary"
      ? "bg-white/10 text-white hover:bg-white/15 border border-[#00ff88]/50 hover:border-[#00ff88]"
      : "bg-transparent text-white/90 hover:text-white border border-white/30 hover:border-[#00ff88]/50",
    !disabled && "hover:shadow-[0_0_30px_rgba(0,255,136,0.5)]",
    className
  );

  const motionProps = {
    whileHover: disabled ? {} : { scale: 1.05 },
    whileTap: disabled ? {} : { scale: 0.98 },
    className: baseClasses,
  };

  const glowEffect = (
    <motion.div
      className="absolute inset-0 rounded-full opacity-0 hover:opacity-100"
      style={{
        background: "radial-gradient(circle, rgba(0,255,136,0.3) 0%, transparent 70%)",
      }}
      transition={{ duration: 0.3 }}
    />
  );

  if (href) {
    return (
      <motion.a href={href} {...motionProps}>
        <span className="relative z-10">{children}</span>
        {glowEffect}
      </motion.a>
    );
  }

  return (
    <motion.button {...motionProps} type={type} onClick={onClick} disabled={disabled}>
      <span className="relative z-10">{children}</span>
      {!disabled && glowEffect}
    </motion.button>
  );
}

