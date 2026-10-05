import type { LucideIcon } from "lucide-react";
import { ClipboardPen, House, ShieldCheck } from "lucide-react";
import { playsafeRoutes } from "@/lib/playsafe/routes";

export type BottomTabItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const BOTTOM_TABS: readonly BottomTabItem[] = [
  { href: playsafeRoutes.home, label: "홈", icon: House },
  { href: playsafeRoutes.facilityInfo, label: "시설정보 입력", icon: ClipboardPen },
  { href: playsafeRoutes.assessment, label: "안전성평가", icon: ShieldCheck },
];
