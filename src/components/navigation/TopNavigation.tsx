"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const menuItems = [
  { id: "hero", label: "홈" },
  { id: "why", label: "왜 필요한가요" },
  { id: "target", label: "평가 대상" },
  { id: "process", label: "평가 절차" },
  { id: "obligation", label: "의무 사항" },
  { id: "result", label: "결과 활용" },
  { id: "education", label: "교육 신청" },
  { id: "cta", label: "문의하기" },
];

export function TopNavigation() {
  const [activeSection, setActiveSection] = useState<string>("hero");
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true);
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
        } else if (
          !isCenterInSection &&
          maxVisibleRatio === 0 &&
          visibleRatio > 0.5
        ) {
          if (visibleRatio > maxVisibleRatio) {
            maxVisibleRatio = visibleRatio;
            currentSection = section.id || "hero";
          }
        }
      });

      setActiveSection(currentSection);

      setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // 초기 실행

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offsetTop = element.offsetTop - 80; // 네비게이션 높이만큼 오프셋
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel mx-4 mt-4 md:mx-8 md:mt-6 rounded-2xl">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <div className="text-white font-medium text-lg md:text-xl">
            <span className="text-[#00ff88]">신종놀이시설</span> 안전성평가
          </div>
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {menuItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => handleClick(e, item.id)}
                  className={cn(
                    "relative px-3 lg:px-4 py-2 rounded-full text-sm lg:text-base font-light transition-all duration-300",
                    isActive
                      ? "text-[#00ff88]"
                      : "text-white/70 hover:text-[#00ff88]"
                  )}
                >
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute inset-0 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/50"
                      style={{
                        boxShadow: "0 0 20px rgba(0,255,136,0.3)",
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}
                </a>
              );
            })}
          </div>
          {/* 모바일 메뉴 */}
          <div className="md:hidden">
            <select
              value={activeSection}
              onChange={(e) => {
                const id = e.target.value;
                handleClick(
                  { preventDefault: () => {} } as any,
                  id
                );
              }}
              className="glass-panel bg-white/10 border border-white/20 text-white text-sm px-3 py-2 rounded-full appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='white' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 12px center",
                paddingRight: "32px",
              }}
            >
              {menuItems.map((item) => (
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

