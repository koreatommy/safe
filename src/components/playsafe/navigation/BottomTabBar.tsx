"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BOTTOM_TABS } from "@/data/playsafe/bottom-tabs";
import "./bottom-tab-bar.css";

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="bottom-tabs" aria-label="하단 메뉴">
      {BOTTOM_TABS.map(({ href, label, icon: Icon }) => {
        const active = href === pathname;
        return (
          <Link
            key={href}
            href={href}
            className={active ? "active" : undefined}
            aria-current={active ? "page" : undefined}
          >
            <Icon aria-hidden="true" size={22} strokeWidth={active ? 2.2 : 1.8} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
