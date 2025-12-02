"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut, Users } from "lucide-react";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { GlowCapsuleButton } from "@/components/glass/GlowCapsuleButton";
import { ApplicationsTable } from "@/components/admin/ApplicationsTable";
import { isAuthenticated, logout } from "@/lib/auth";

export default function AdminPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

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

  return (
    <div className="min-h-screen p-4 md:p-8" style={{
      background: "linear-gradient(135deg, #0f121a 0%, #1b1f2a 50%, #0c0f18 100%)",
    }}>
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
                <Users className="w-5 h-5 text-[#00ff88]" />
              </div>
              <h1 className="font-medium text-white" style={{ fontSize: '1.25rem', lineHeight: '1.5' }}>신청자 접수현황</h1>
            </div>
            <p className="text-white/70" style={{ fontSize: '0.875rem' }}>교육 신청자 목록을 확인하고 관리하세요</p>
          </div>
          <GlowCapsuleButton
            onClick={handleLogout}
            variant="secondary"
            className="flex items-center gap-2 !px-4 !py-2"
            style={{ fontSize: '0.875rem' }}
          >
            <LogOut className="w-3.5 h-3.5" />
            로그아웃
          </GlowCapsuleButton>
        </motion.div>

        {/* 테이블 */}
        <GlassPanel>
          <ApplicationsTable />
        </GlassPanel>
      </div>
    </div>
  );
}

