"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { INFO_NAV_ITEMS } from "@/data/legal-obligations";

const NAV_OFFSET = 88;

export function InfoNavigation() {
  const [activeSection, setActiveSection] = useState<string>("hero");

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("section[id]");
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      const viewportCenter = scrollY + viewportHeight / 2;

      let currentSection = "hero";
      let maxVisibleRatio = 0;

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const sectionTop = scrollY + rect.top;
        const sectionBottom = sectionTop + rect.height;

        const visibleTop = Math.max(0, -rect.top);
        const visibleBottom = Math.min(viewportHeight, rect.bottom);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);
        const visibleRatio = visibleHeight / viewportHeight;

        const isCenterInSection =
          viewportCenter >= sectionTop && viewportCenter <= sectionBottom;

        if (isCenterInSection && visibleRatio > maxVisibleRatio) {
          maxVisibleRatio = visibleRatio;
          currentSection = section.id || "hero";
        } else if (!isCenterInSection && maxVisibleRatio === 0 && visibleRatio > 0.5) {
          if (visibleRatio > maxVisibleRatio) {
            maxVisibleRatio = visibleRatio;
            currentSection = section.id || "hero";
          }
        }
      });

      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - NAV_OFFSET,
        behavior: "smooth",
      });
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    scrollToSection(id);
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 glass-panel mx-4 mt-4 md:mx-8 md:mt-6 rounded-2xl border-[#1e3a5f]/40"
      aria-label="양주시 안전관리자 교육 메뉴"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between gap-4">
          <a
            href="#hero"
            onClick={(e) => handleClick(e, "hero")}
            className="text-white font-medium text-sm md:text-base shrink-0"
          >
            <span className="text-[#2d8a4e]">양주시</span>{" "}
            <span className="hidden sm:inline">어린이놀이시설 안전관리자 교육</span>
            <span className="sm:hidden">안전관리자 교육</span>
          </a>

          <div className="hidden lg:flex items-center gap-1">
            {INFO_NAV_ITEMS.filter((item) => item.id !== "hero").map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => handleClick(e, item.id)}
                  className={cn(
                    "relative px-3 py-2 rounded-full text-sm font-light transition-all duration-300",
                    isActive ? "text-[#2d8a4e]" : "text-white/70 hover:text-[#2d8a4e]"
                  )}
                >
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="infoActiveIndicator"
                      className="absolute inset-0 rounded-full bg-[#2d8a4e]/10 border border-[#2d8a4e]/50"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </a>
              );
            })}
          </div>

          <div className="lg:hidden">
            <select
              value={activeSection}
              onChange={(e) => scrollToSection(e.target.value)}
              className="glass-panel bg-white/10 border border-white/20 text-white text-sm px-3 py-2 rounded-full appearance-none cursor-pointer max-w-[180px] sm:max-w-none"
              aria-label="섹션 이동"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='white' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 12px center",
                paddingRight: "32px",
              }}
            >
              {INFO_NAV_ITEMS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </nav>
  );
}
