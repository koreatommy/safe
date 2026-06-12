"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LegalObligation } from "@/data/legal-obligations";

interface LegalObligationCardProps {
  obligation: LegalObligation;
  defaultOpen?: boolean;
}

function BadgeList({ badges }: { badges: string[] }) {
  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {badges.map((badge) => (
        <span
          key={badge}
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f59e0b]/20 text-[#fbbf24] border border-[#f59e0b]/40"
        >
          {badge}
        </span>
      ))}
    </div>
  );
}

export function LegalObligationCard({ obligation, defaultOpen = false }: LegalObligationCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <article className="glass-panel overflow-hidden border-[#1e3a5f]/30">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-start justify-between gap-4 p-5 md:p-6 text-left hover:bg-white/5 transition-colors"
        aria-expanded={isOpen}
        aria-controls={`obligation-${obligation.id}`}
      >
        <div className="flex-1 min-w-0">
          <h3 className="text-white text-base md:text-lg font-medium mb-2">{obligation.title}</h3>
          {obligation.badges && obligation.badges.length > 0 && (
            <BadgeList badges={obligation.badges} />
          )}
        </div>
        <ChevronDown
          className={cn(
            "w-5 h-5 text-[#2d8a4e] shrink-0 transition-transform duration-300 mt-1",
            isOpen && "rotate-180"
          )}
          aria-hidden
        />
      </button>

      <div
        id={`obligation-${obligation.id}`}
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-in-out",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="px-5 md:px-6 pb-5 md:pb-6 space-y-5 border-t border-white/10 pt-4">
            {obligation.items.map((item) => (
              <div key={item.subtitle}>
                <h4 className="text-white/95 text-sm md:text-base font-medium mb-2">
                  {item.subtitle}
                </h4>
                {item.badges && item.badges.length > 0 && <BadgeList badges={item.badges} />}
                <ul className="space-y-2">
                  {item.content.map((line) => (
                    <li
                      key={line}
                      className="text-white/75 text-sm md:text-base leading-relaxed pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-[#2d8a4e]"
                    >
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
