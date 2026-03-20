"use client";

import { useState } from "react";
import {
  LayoutDashboard, ClipboardList, Search, CheckSquare,
  FileText, Settings, ChevronDown, Users, MessageSquare,
  CalendarDays, FolderOpen, Building2, MonitorCheck,
  FileCheck, CheckCircle, GanttChart, Camera, X,
} from "lucide-react";

export type MenuItemId =
  | "dashboard"
  | "plan-register" | "plan-calendar" | "plan-manage"
  | "inspect-facility" | "inspect-monitor" | "inspect-report-pre"
  | "result-check" | "result-gantt" | "result-photo"
  | "final-report"
  | "settings"
  | "applications" | "inquiries";

interface SubMenuItem {
  id: MenuItemId;
  label: string;
}

interface MenuSection {
  id: string;
  label: string;
  icon: React.ReactNode;
  children?: SubMenuItem[];
  menuId?: MenuItemId;
}

const menuSections: MenuSection[] = [
  {
    id: "dashboard",
    label: "종합 대시보드",
    icon: <LayoutDashboard className="w-5 h-5" />,
    menuId: "dashboard",
  },
  {
    id: "plan",
    label: "안전성평가 계획",
    icon: <ClipboardList className="w-5 h-5" />,
    children: [
      { id: "plan-register", label: "계획 등록" },
      { id: "plan-calendar", label: "점검 캘린더" },
      { id: "plan-manage", label: "계획 관리" },
    ],
  },
  {
    id: "inspect",
    label: "안전성 평가",
    icon: <Search className="w-5 h-5" />,
    children: [
      { id: "inspect-facility", label: "대상시설 확인" },
      { id: "inspect-monitor", label: "평가 모니터링" },
      { id: "inspect-report-pre", label: "평가보고서(이행전)" },
    ],
  },
  {
    id: "result",
    label: "이행결과 확인",
    icon: <CheckSquare className="w-5 h-5" />,
    children: [
      { id: "result-check", label: "이행 확인" },
      { id: "result-gantt", label: "이행 일정(간트)" },
      { id: "result-photo", label: "이행결과 사진" },
    ],
  },
  {
    id: "final-report",
    label: "안전성평가 보고서",
    icon: <FileText className="w-5 h-5" />,
    menuId: "final-report",
  },
  {
    id: "settings-section",
    label: "설정 관리",
    icon: <Settings className="w-5 h-5" />,
    menuId: "settings",
  },
  {
    id: "divider-admin",
    label: "",
    icon: null,
  },
  {
    id: "admin-data",
    label: "데이터 관리",
    icon: <FolderOpen className="w-5 h-5" />,
    children: [
      { id: "applications", label: "교육신청자 접수현황" },
      { id: "inquiries", label: "문의사항 현황" },
    ],
  },
];

interface AdminSidebarProps {
  activeMenu: MenuItemId;
  onMenuSelect: (id: MenuItemId) => void;
  sidebarOpen: boolean;
  onClose: () => void;
  logoutButton: React.ReactNode;
}

function findParentSectionId(menuId: MenuItemId): string | null {
  for (const section of menuSections) {
    if (section.children?.some((c) => c.id === menuId)) return section.id;
  }
  return null;
}

export function AdminSidebar({
  activeMenu,
  onMenuSelect,
  sidebarOpen,
  onClose,
  logoutButton,
}: AdminSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
    const ids = new Set<string>();
    menuSections.forEach((s) => {
      if (s.children?.length) ids.add(s.id);
    });
    return ids;
  });

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  return (
    <>
      <div className="shrink-0 p-4 md:p-5 border-b border-white/10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-[#00ff88]/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
            <LayoutDashboard className="w-4 h-4 text-[#00ff88] shrink-0" />
          </div>
          <h1 className="font-semibold text-white truncate" style={{ fontSize: "0.9375rem" }}>
            관리자 대시보드
          </h1>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="md:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 shrink-0"
          aria-label="메뉴 닫기"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 min-h-0 py-3 overflow-y-auto">
        {menuSections.map((section) => {
          if (section.id === "divider-admin") {
            return (
              <div key={section.id} className="my-3 mx-4 border-t border-white/10" />
            );
          }

          const isTopLevel = !section.children;
          const hasChildren = !!section.children;
          const isExpanded = expandedSections.has(section.id);
          const isActive = isTopLevel && section.menuId === activeMenu;
          const hasActiveChild = hasChildren && section.children!.some((c) => c.id === activeMenu);

          if (isTopLevel && section.menuId) {
            return (
              <button
                key={section.id}
                onClick={() => onMenuSelect(section.menuId!)}
                className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors ${
                  isActive
                    ? "bg-[#00ff88]/15 text-[#00ff88] border-r-2 border-[#00ff88]"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className={`flex-shrink-0 ${isActive ? "text-[#00ff88]" : "text-white/50"}`}>
                  {section.icon}
                </span>
                <span className="font-medium truncate" style={{ fontSize: "0.875rem" }}>
                  {section.label}
                </span>
              </button>
            );
          }

          return (
            <div key={section.id}>
              <button
                onClick={() => toggleSection(section.id)}
                className={`w-full flex items-center justify-between gap-2 px-5 py-2.5 text-left transition-colors ${
                  hasActiveChild
                    ? "text-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`flex-shrink-0 ${hasActiveChild ? "text-[#00ff88]" : "text-white/50"}`}>
                    {section.icon}
                  </span>
                  <span className="font-medium truncate" style={{ fontSize: "0.875rem" }}>
                    {section.label}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-white/40 shrink-0 transition-transform duration-200 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isExpanded && section.children && (
                <div className="pb-1">
                  {section.children.map((child) => {
                    const childActive = child.id === activeMenu;
                    return (
                      <button
                        key={child.id}
                        onClick={() => onMenuSelect(child.id)}
                        className={`w-full text-left pl-12 pr-5 py-2 truncate transition-colors ${
                          childActive
                            ? "text-[#00ff88] bg-[#00ff88]/10"
                            : "text-white/50 hover:text-white/80 hover:bg-white/5"
                        }`}
                        style={{ fontSize: "0.875rem" }}
                      >
                        {child.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="shrink-0 p-4 border-t border-white/10">
        {logoutButton}
      </div>
    </>
  );
}

export function getMenuMeta(id: MenuItemId): { label: string; description: string; icon: React.ReactNode } {
  const map: Record<MenuItemId, { label: string; description: string; icon: React.ReactNode }> = {
    "dashboard": { label: "종합 대시보드", description: "전체 현황을 확인하세요", icon: <LayoutDashboard className="w-5 h-5" /> },
    "plan-register": { label: "계획 등록", description: "지도점검 계획을 등록하세요", icon: <CalendarDays className="w-5 h-5" /> },
    "plan-calendar": { label: "점검 캘린더", description: "점검 일정을 캘린더로 확인하세요", icon: <CalendarDays className="w-5 h-5" /> },
    "plan-manage": { label: "계획 관리", description: "등록된 계획을 관리하세요", icon: <ClipboardList className="w-5 h-5" /> },
    "inspect-facility": { label: "대상시설 확인", description: "점검 대상 시설을 확인하세요", icon: <Building2 className="w-5 h-5" /> },
    "inspect-monitor": { label: "평가 모니터링", description: "안전성 평가 현황을 모니터링하세요", icon: <MonitorCheck className="w-5 h-5" /> },
    "inspect-report-pre": { label: "평가보고서(이행전)", description: "이행 전 평가보고서를 확인하세요", icon: <FileCheck className="w-5 h-5" /> },
    "result-check": { label: "이행 확인", description: "이행 결과를 확인하세요", icon: <CheckCircle className="w-5 h-5" /> },
    "result-gantt": { label: "이행 일정(간트)", description: "이행 일정을 간트 차트로 확인하세요", icon: <GanttChart className="w-5 h-5" /> },
    "result-photo": { label: "이행결과 사진", description: "이행결과 사진을 확인하세요", icon: <Camera className="w-5 h-5" /> },
    "final-report": { label: "안전성평가 보고서", description: "최종 안전성평가 보고서를 확인하세요", icon: <FileText className="w-5 h-5" /> },
    "settings": { label: "설정 관리", description: "시스템 설정을 관리하세요", icon: <Settings className="w-5 h-5" /> },
    "applications": { label: "교육신청자 접수현황", description: "교육 신청자 목록을 확인하고 관리하세요", icon: <Users className="w-5 h-5" /> },
    "inquiries": { label: "문의사항 현황", description: "문의사항 목록을 확인하고 관리하세요", icon: <MessageSquare className="w-5 h-5" /> },
  };
  return map[id];
}
