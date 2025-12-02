"use client";

import { useState } from "react";
import { GlowCapsuleButton } from "@/components/glass/GlowCapsuleButton";
import { motion } from "framer-motion";
import { User, Mail, Phone, Building2, Send } from "lucide-react";
import { supabase } from "@/lib/supabase";
import confetti from "canvas-confetti";

export function EducationApplicationForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    affiliation: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // 에러 초기화
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "이름을 입력해주세요.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "이메일을 입력해주세요.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "올바른 이메일 형식을 입력해주세요.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "전화번호를 입력해주세요.";
    } else if (!/^[0-9-]+$/.test(formData.phone)) {
      newErrors.phone = "올바른 전화번호 형식을 입력해주세요.";
    }

    if (!formData.affiliation.trim()) {
      newErrors.affiliation = "소속을 입력해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase
        .from('safe_education_applications')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            affiliation: formData.affiliation,
          }
        ])
        .select();

      if (error) {
        console.error('Supabase 저장 오류:', error);
        setErrors({ submit: '신청 저장 중 오류가 발생했습니다. 다시 시도해주세요.' });
        setIsSubmitting(false);
        return;
      }

      console.log('저장된 데이터:', data);
      
      // 폭죽 효과
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: NodeJS.Timeout = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      // 중앙에서 폭발하는 효과
      confetti({
        ...defaults,
        particleCount: 100,
        origin: { x: 0.5, y: 0.5 },
        colors: ['#00ff88', '#39ff14', '#ffffff', '#b7d7ff', '#c4f2ff']
      });
      
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // 3초 후 폼 초기화
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: "", email: "", phone: "", affiliation: "" });
    }, 3000);
    } catch (error) {
      console.error('예상치 못한 오류:', error);
      setErrors({ submit: '신청 저장 중 오류가 발생했습니다. 다시 시도해주세요.' });
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="w-20 h-20 rounded-full bg-[#00ff88]/20 flex items-center justify-center mx-auto mb-6">
          <Send className="w-10 h-10 text-[#00ff88]" />
        </div>
        <h3 className="text-white text-2xl font-medium mb-4">
          신청이 완료되었습니다!
        </h3>
        <p className="text-white/70 text-lg">
          접수 확인 후 개별 안내 문자를 발송해드리겠습니다.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* 이름 */}
        <div>
          <label
            htmlFor="name"
            className="flex items-center gap-2 text-white/90 font-medium mb-2"
          >
            <User className="w-4 h-4 text-[#00ff88]" />
            이름 <span className="text-[#00ff88]">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl glass-panel border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#00ff88] transition-all"
            placeholder="이름을 입력해주세요"
          />
          {errors.name && (
            <p className="text-red-400 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* 이메일 */}
        <div>
          <label
            htmlFor="email"
            className="flex items-center gap-2 text-white/90 font-medium mb-2"
          >
            <Mail className="w-4 h-4 text-[#00ff88]" />
            이메일 <span className="text-[#00ff88]">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl glass-panel border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#00ff88] transition-all"
            placeholder="example@email.com"
          />
          {errors.email && (
            <p className="text-red-400 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* 전화번호 */}
        <div>
          <label
            htmlFor="phone"
            className="flex items-center gap-2 text-white/90 font-medium mb-2"
          >
            <Phone className="w-4 h-4 text-[#00ff88]" />
            전화번호 <span className="text-[#00ff88]">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl glass-panel border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#00ff88] transition-all"
            placeholder="010-1234-5678"
          />
          {errors.phone && (
            <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
          )}
        </div>

        {/* 소속 */}
        <div>
          <label
            htmlFor="affiliation"
            className="flex items-center gap-2 text-white/90 font-medium mb-2"
          >
            <Building2 className="w-4 h-4 text-[#00ff88]" />
            소속 <span className="text-[#00ff88]">*</span>
          </label>
          <input
            type="text"
            id="affiliation"
            name="affiliation"
            value={formData.affiliation}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl glass-panel border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#00ff88] transition-all"
            placeholder="소속 기관 또는 회사명"
          />
          {errors.affiliation && (
            <p className="text-red-400 text-sm mt-1">{errors.affiliation}</p>
          )}
        </div>
      </div>

      {/* 제출 에러 메시지 */}
      {errors.submit && (
        <div className="text-red-400 text-sm text-center">{errors.submit}</div>
      )}

      {/* 제출 버튼 */}
      <div className="pt-4">
        <GlowCapsuleButton
          type="submit"
          className="w-full md:w-auto text-lg md:text-xl px-10 md:px-12 py-4 md:py-5 group"
          onClick={(e) => {
            // 버튼 클릭 시 폼 제출
          }}
        >
          <span className="flex items-center justify-center gap-2">
            {isSubmitting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                제출 중...
              </>
            ) : (
              <>
                지금 바로 신청하기
                <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </span>
        </GlowCapsuleButton>
      </div>
    </form>
  );
}

