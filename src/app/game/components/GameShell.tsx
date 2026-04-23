'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

interface GameShellProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
  showBackLink?: boolean;
  backLinkHref?: string;
  backLinkText?: string;
  headerRight?: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  className?: string;
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
};

export default function GameShell({
  children,
  title,
  subtitle,
  showHeader = true,
  showBackLink = false,
  backLinkHref = '/game',
  backLinkText = '← 퀴즈 홈',
  headerRight,
  maxWidth = '3xl',
  className = '',
}: GameShellProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const motionProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: -10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 },
      };

  const contentMotionProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4, delay: 0.1 },
      };

  return (
    <div className={`min-h-screen py-6 sm:py-8 px-4 sm:px-6 ${className}`}>
      <div className={`mx-auto ${maxWidthClasses[maxWidth]}`}>
        {showHeader && (title || showBackLink || headerRight) && (
          <motion.header {...motionProps} className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                {showBackLink && (
                  <Link
                    href={backLinkHref}
                    className="inline-flex items-center gap-1 text-sm text-black hover:text-yellow-500 transition-colors mb-2"
                  >
                    {backLinkText}
                  </Link>
                )}
                {title && (
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black truncate">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-black mt-1 text-sm sm:text-base">
                    {subtitle}
                  </p>
                )}
              </div>
              {headerRight && (
                <div className="flex-shrink-0">{headerRight}</div>
              )}
            </div>
          </motion.header>
        )}

        <motion.main {...contentMotionProps}>{children}</motion.main>
      </div>
    </div>
  );
}
