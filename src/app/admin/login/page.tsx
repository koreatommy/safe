"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { GlowCapsuleButton } from "@/components/glass/GlowCapsuleButton";
import { login, isAuthenticated } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/admin");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (login(password)) {
      router.push("/admin");
    } else {
      setError("비밀번호가 올바르지 않습니다.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: "linear-gradient(135deg, #0f121a 0%, #1b1f2a 50%, #0c0f18 100%)",
    }}>
      <GlassPanel className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="w-14 h-14 rounded-full bg-[#00ff88]/20 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-[#00ff88]" />
          </div>
          <h1 className="font-medium text-white mb-2" style={{ fontSize: '1.5rem', lineHeight: '1.5' }}>관리자 로그인</h1>
          <p className="text-white/70" style={{ fontSize: '0.9375rem' }}>신청자 접수현황을 확인하세요</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="password"
              className="flex items-center gap-2 text-white/90 font-medium mb-2"
              style={{ fontSize: '0.9375rem' }}
            >
              <Lock className="w-4 h-4 text-[#00ff88]" />
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl glass-panel border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#00ff88] transition-all"
              placeholder="비밀번호를 입력하세요"
              style={{ fontSize: '0.9375rem' }}
              autoFocus
            />
            {error && (
              <p className="text-red-400 text-sm mt-2">{error}</p>
            )}
          </div>

          <GlowCapsuleButton
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "로그인 중..." : "로그인"}
          </GlowCapsuleButton>
        </form>
      </GlassPanel>
    </div>
  );
}

