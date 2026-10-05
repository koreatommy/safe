"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NAV_LINKS } from "@/data/playsafe/navigation";
import { playsafeRoutes } from "@/lib/playsafe/routes";
import { NavDropdown } from "./NavDropdown";
import "./nav.css";

export function SiteNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const readingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (readingRef.current) {
        readingRef.current.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="nav">
      <div className="wrap nav-inner">
        <Link className="brand" href={playsafeRoutes.home}>
          <span className="brand-icon">✓</span>
          <span>
            신종유사놀이시설 안내
            <small>PLAY SAFE · SAFETY GUIDELINE</small>
          </span>
        </Link>
        <nav className={`links${menuOpen ? " open" : ""}`} id="navlinks" aria-label="주 메뉴">
          {NAV_LINKS.map((link) => {
            if (link.children) {
              return (
                <NavDropdown
                  key={link.label}
                  item={link}
                  pathname={pathname}
                  onNavigate={() => setMenuOpen(false)}
                />
              );
            }
            const active = link.href === pathname;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={active ? "active" : undefined}
                aria-current={active ? "page" : undefined}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <Link href={playsafeRoutes.facilityInfo} className="btn primary">
          안전성평가 시작 ↗
        </Link>
        <button
          type="button"
          className="btn menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="navlinks"
          onClick={() => setMenuOpen((open) => !open)}
        >
          메뉴 ☰
        </button>
      </div>
      <div className="reading" ref={readingRef} aria-hidden="true" />
    </header>
  );
}
