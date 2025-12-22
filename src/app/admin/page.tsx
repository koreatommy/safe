"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut, Users, MessageSquare, LayoutDashboard } from "lucide-react";
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

  return (
    <div className="min-h-screen" style={{
      background: "linear-gradient(135deg, #0f121a 0%, #1b1f2a 50%, #0c0f18 100%)",
    }}>
      <div className="flex h-screen overflow-hidden">
        {/* 사이드바 */}
        <motion.aside
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-64 border-r border-white/10 bg-black/20 flex flex-col"
        >
          {/* 로고/제목 영역 */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#00ff88]/20 flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-[#00ff88]" />
              </div>
              <h1 className="font-medium text-white" style={{ fontSize: '1.125rem', lineHeight: '1.5' }}>
                관리자 대시보드
              </h1>
            </div>
          </div>

          {/* 메뉴 항목 */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeMenu === item.id
                    ? "bg-[#00ff88]/20 border border-[#00ff88]/50 text-white"
                    : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className={`flex-shrink-0 ${activeMenu === item.id ? "text-[#00ff88]" : "text-white/60"}`}>
                  {item.icon}
                </div>
                <span className="font-medium" style={{ fontSize: '0.875rem' }}>
                  {item.label}
                </span>
              </button>
            ))}
          </nav>

          {/* 로그아웃 버튼 */}
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
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* 헤더 */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-[#00ff88]/20 flex items-center justify-center">
                    {activeMenuItem?.icon && (
                      <div className="text-[#00ff88]">
                        {activeMenuItem.icon}
                      </div>
                    )}
                  </div>
                  <h1 className="font-medium text-white" style={{ fontSize: '1.25rem', lineHeight: '1.5' }}>
                    {activeMenuItem?.label}
                  </h1>
                </div>
                <p className="text-white/70" style={{ fontSize: '0.875rem' }}>
                  {activeMenuItem?.description}
                </p>
              </div>
            </motion.div>

            {/* 테이블 */}
            <GlassPanel>
              {activeMenu === "applications" && <ApplicationsTable />}
              {activeMenu === "inquiries" && <InquiriesTable />}
            </GlassPanel>
          </div>
        </div>
      </div>
    </div>
  );
}

