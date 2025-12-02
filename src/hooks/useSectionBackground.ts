"use client";

import { useEffect, useState } from "react";

const sectionColors: Record<string, string> = {
  hero: "#000000",
  why: "#000000",
  target: "#000000",
  process: "#000000",
  obligation: "#000000",
  result: "#000000",
  education: "#000000",
  infographic: "#000000",
  cta: "#000000",
};

export function useSectionBackground() {
  const [currentSection, setCurrentSection] = useState<string>("hero");

  useEffect(() => {
    const updateBackgroundImage = () => {
      if (typeof document === "undefined") return;
      
      const educationSection = document.getElementById("education");
      if (educationSection) {
        const educationTop = educationSection.offsetTop;
        const scrollY = window.scrollY;
        const viewportHeight = window.innerHeight;
        
        // 교육 섹션에 도달했는지 확인 (뷰포트 중앙이 교육 섹션에 도달하면)
        const hasReachedEducation = scrollY + viewportHeight / 2 >= educationTop;
        
        if (hasReachedEducation) {
          // 3232.jpg로 전환 (첫 번째 이미지 fade out, 두 번째 이미지 fade in)
          document.documentElement.style.setProperty("--bg-opacity-1", "0");
          document.documentElement.style.setProperty("--bg-opacity-2", "1");
        } else {
          // 578.jpg로 유지 (첫 번째 이미지 fade in, 두 번째 이미지 fade out)
          document.documentElement.style.setProperty("--bg-opacity-1", "1");
          document.documentElement.style.setProperty("--bg-opacity-2", "0");
        }
      }
    };

    const updateBackground = () => {
      const sections = document.querySelectorAll("section[id]");
      const viewportHeight = window.innerHeight;
      const scrollY = window.scrollY;
      const viewportCenter = scrollY + viewportHeight / 2;
      
      let activeSection = "hero";
      let maxVisibleRatio = 0;

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const sectionTop = scrollY + rect.top;
        const sectionBottom = sectionTop + rect.height;
        
        // 섹션이 뷰포트에 얼마나 보이는지 계산
        const visibleTop = Math.max(0, -rect.top);
        const visibleBottom = Math.min(viewportHeight, rect.bottom);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);
        const visibleRatio = visibleHeight / viewportHeight;
        
        // 뷰포트 중앙이 섹션 내에 있는 경우 우선 선택
        const isCenterInSection = viewportCenter >= sectionTop && viewportCenter <= sectionBottom;
        
        if (isCenterInSection && visibleRatio > maxVisibleRatio) {
          maxVisibleRatio = visibleRatio;
          activeSection = section.id || "hero";
        } else if (!isCenterInSection && maxVisibleRatio === 0 && visibleRatio > 0.5) {
          // 중앙에 섹션이 없으면 가장 많이 보이는 섹션 선택
          if (visibleRatio > maxVisibleRatio) {
            maxVisibleRatio = visibleRatio;
            activeSection = section.id || "hero";
          }
        }
      });

      if (activeSection !== currentSection) {
        setCurrentSection(activeSection);
      }
      
      // 배경 이미지 업데이트
      updateBackgroundImage();
    };

    // 초기 설정
    updateBackground();

    // 스크롤 이벤트 리스너
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateBackground();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateBackground);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateBackground);
    };
  }, [currentSection]);

  useEffect(() => {
    const color = sectionColors[currentSection] || sectionColors.hero;
    // body와 html 모두 배경색 설정
    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty("--current-bg-color", color);
      document.body.style.setProperty("background-color", color);
      document.body.style.setProperty("background", color);
    }
  }, [currentSection]);

  return currentSection;
}

