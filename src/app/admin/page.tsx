"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Users, MessageSquare, LayoutDashboard, Menu, X } from "lucide-react";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { GlowCapsuleButton } from "@/components/glass/GlowCapsuleButton";
import { ApplicationsTable } from "@/components/admin/ApplicationsTable";
import { InquiriesTable } from "@/components/admin/InquiriesTable";
import { isAuthenticated, logout } from "@/lib/auth";

export const dynamic = 'force-dynamic';

type MenuItem = "applications" | "inquiries";

export default function AdminPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [activeMenu, setActiveMenu] = useState<MenuItem>("applications");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/admin/login");
    } else {
      setIsChecking(false);
    }
  }, [router]);

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: "linear-gradient(135deg, #0f121a 0%, #1b1f2a 50%, #0c0f18 100%)",
      }}>
        <div className="text-white/70">로딩 중...</div>
      </div>
    );
  }

  const menuItems: { id: MenuItem; label: string; icon: React.ReactNode; description: string }[] = [
    {
      id: "applications",
      label: "교육신청자접수현황",
      icon: <Users className="w-5 h-5" />,
      description: "교육 신청자 목록을 확인하고 관리하세요",
    },
    {
      id: "inquiries",
      label: "문의사항 현황",
      icon: <MessageSquare className="w-5 h-5" />,
      description: "문의사항 목록을 확인하고 관리하세요",
    },
  ];

  const activeMenuItem = menuItems.find((item) => item.id === activeMenu);

  const closeSidebar = () => setSidebarOpen(false);
  const onMenuSelect = (id: MenuItem) => {
    setActiveMenu(id);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen min-w-0 overflow-x-hidden" style={{
      background: "linear-gradient(135deg, #0f121a 0%, #1b1f2a 50%, #0c0f18 100%)",
    }}>
      <div className="flex h-screen overflow-hidden max-w-[100vw]">
        {/* 모바일: 햄버거 열림 시 배경 오버레이 */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
              onClick={closeSidebar}
              aria-hidden
            />
          )}
        </AnimatePresence>

        {/* 사이드바: 데스크톱 고정, 모바일 드로어 */}
        <motion.aside
          initial={false}
          animate={{ x: sidebarOpen ? 0 : undefined }}
          transition={{ type: "tween", duration: 0.25 }}
          className={`
            fixed md:relative inset-y-0 left-0 z-50
            w-64 min-w-[16rem] border-r border-white/10 bg-black/95 md:bg-black/20
            flex flex-col
            md:translate-x-0
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <div className="p-4 md:p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#00ff88]/20 flex items-center justify-center flex-shrink-0">
                <LayoutDashboard className="w-5 h-5 text-[#00ff88]" />
              </div>
              <h1 className="font-medium text-white" style={{ fontSize: '1.125rem', lineHeight: '1.5' }}>
                관리자 대시보드
              </h1>
            </div>
            <button
              type="button"
              onClick={closeSidebar}
              className="md:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
              aria-label="메뉴 닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onMenuSelect(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeMenu === item.id
                    ? "bg-[#00ff88]/20 border border-[#00ff88]/50 text-white"
                    : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className={`flex-shrink-0 ${activeMenu === item.id ? "text-[#00ff88]" : "text-white/60"}`}>
                  {item.icon}
                </div>
                <span className="font-medium text-left" style={{ fontSize: '0.875rem' }}>
                  {item.label}
                </span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-white/10">
            <GlowCapsuleButton
              onClick={handleLogout}
              variant="secondary"
              className="w-full flex items-center justify-center gap-2 !px-4 !py-2"
              style={{ fontSize: '0.875rem' }}
            >
              <LogOut className="w-3.5 h-3.5" />
              로그아웃
            </GlowCapsuleButton>
          </div>
        </motion.aside>

        {/* 메인 콘텐츠 영역 */}
        <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden px-3 py-4 sm:p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 min-w-0">
            {/* 헤더 + 모바일 메뉴 버튼 */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div className="flex items-center gap-3 w-full min-w-0">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="md:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 flex-shrink-0"
                  aria-label="메뉴 열기"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="hidden md:block w-10 h-10 rounded-full bg-[#00ff88]/20 flex items-center justify-center flex-shrink-0">
                      {activeMenuItem?.icon && (
                        <div className="text-[#00ff88]">{activeMenuItem.icon}</div>
                      )}
                    </div>
                    <h1 className="font-medium text-white truncate" style={{ fontSize: '1.125rem', lineHeight: '1.5' }}>
                      {activeMenuItem?.label}
                    </h1>
                  </div>
                  <p className="text-white/70 truncate" style={{ fontSize: '0.875rem' }}>
                    {activeMenuItem?.description}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* 테이블 */}
            <GlassPanel className="min-w-0 overflow-hidden">
              {activeMenu === "applications" && <ApplicationsTable />}
              {activeMenu === "inquiries" && <InquiriesTable />}
            </GlassPanel>
          </div>
        </div>
      </div>
    </div>
  );
}

