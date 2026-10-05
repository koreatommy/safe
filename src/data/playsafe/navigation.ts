import { playsafeRoutes } from "@/lib/playsafe/routes";

export type NavLinkItem = {
  href: string;
  label: string;
  /** Pathname prefix that marks this item active when a child page is open. */
  matchPrefix?: string;
  children?: readonly NavLinkItem[];
};

export const NAV_LINKS: readonly NavLinkItem[] = [
  { href: "/#about", label: "평가 대상" },
  { href: "/#types", label: "놀이 유형" },
  { href: "/#process", label: "평가 절차" },
  { href: "/#risks", label: "위험요소" },
  {
    href: playsafeRoutes.facilityInfo,
    label: "안전성평가",
    matchPrefix: playsafeRoutes.assessment,
    children: [
      { href: playsafeRoutes.facilityInfo, label: "시설정보입력" },
      { href: playsafeRoutes.assessment, label: "안전성평가" },
    ],
  },
  { href: "/#faq", label: "FAQ" },
];
