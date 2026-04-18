"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Menu } from "lucide-react";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { GlowCapsuleButton } from "@/components/glass/GlowCapsuleButton";
import { ApplicationsTable } from "@/components/admin/ApplicationsTable";
import { InquiriesTable } from "@/components/admin/InquiriesTable";
import { ProductOrdersTable } from "@/components/admin/ProductOrdersTable";
import { AdminSidebar, getMenuMeta } from "@/components/admin/AdminSidebar";
import type { MenuItemId } from "@/components/admin/AdminSidebar";
import { isAuthenticated, logout } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default function AdminPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [activeMenu, setActiveMenu] = useState<MenuItemId>("dashboard");
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

  const closeSidebar = () => setSidebarOpen(false);
  const onMenuSelect = (id: MenuItemId) => {
    setActiveMenu(id);
    setSidebarOpen(false);
  };

  const meta = getMenuMeta(activeMenu);

  const logoutBtn = (
    <GlowCapsuleButton
      onClick={handleLogout}
      variant="secondary"
      className="w-full flex items-center justify-center gap-2 !px-4 !py-2"
      style={{ fontSize: '0.875rem' }}
    >
      <LogOut className="w-3.5 h-3.5" />
      로그아웃
    </GlowCapsuleButton>
  );

  return (
    <div className="min-h-screen min-w-0 overflow-x-hidden" style={{
      background: "linear-gradient(135deg, #0f121a 0%, #1b1f2a 50%, #0c0f18 100%)",
    }}>
      <div className="flex h-screen overflow-hidden max-w-[100vw]">
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
          <AdminSidebar
            activeMenu={activeMenu}
            onMenuSelect={onMenuSelect}
            sidebarOpen={sidebarOpen}
            onClose={closeSidebar}
            logoutButton={logoutBtn}
          />
        </motion.aside>

        <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden px-3 py-4 sm:p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 min-w-0">
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
                    <div className="hidden md:flex w-10 h-10 rounded-full bg-[#00ff88]/20 items-center justify-center flex-shrink-0 overflow-hidden">
                      <span className="text-[#00ff88] inline-flex items-center justify-center">
                        {meta.icon}
                      </span>
                    </div>
                    <h1 className="font-medium text-white truncate" style={{ fontSize: '1.125rem', lineHeight: '1.5' }}>
                      {meta.label}
                    </h1>
                  </div>
                  <p className="text-white/70 truncate" style={{ fontSize: '0.875rem' }}>
                    {meta.description}
                  </p>
                </div>
              </div>
            </motion.div>

            <GlassPanel className="min-w-0 overflow-hidden">
              {activeMenu === "applications" && <ApplicationsTable />}
              {activeMenu === "inquiries" && <InquiriesTable />}
              {activeMenu === "product_orders" && <ProductOrdersTable />}
              {activeMenu !== "applications" && activeMenu !== "inquiries" && activeMenu !== "product_orders" && (
                <div className="py-16 text-center text-white/50 text-sm">
                  준비 중인 기능입니다.
                </div>
              )}
            </GlassPanel>
          </div>
        </div>
      </div>
    </div>
  );
}

