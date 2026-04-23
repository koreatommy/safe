'use client';

import { useState, FormEvent, useId } from 'react';
import { flushSync } from 'react-dom';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGame } from './context/GameContext';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion';
import { getGameSupabaseClient } from '@/lib/supabase';

interface FormData {
  schoolName: string;
  name: string;
  email: string;
}

interface FormErrors {
  schoolName?: string;
  name?: string;
  email?: string;
  general?: string;
}

export default function GameRegistrationForm() {
  const router = useRouter();
  const { setParticipant, resetAnswers } = useGame();
  const prefersReducedMotion = usePrefersReducedMotion();
  const formId = useId();
  
  const [formData, setFormData] = useState<FormData>({
    schoolName: '',
    name: '',
    email: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.schoolName.trim()) {
      newErrors.schoolName = '학교명을 입력해주세요.';
    }

    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요.';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = '이름은 2자 이상 입력해주세요.';
    }

    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setErrors({});

    try {
      const supabase = getGameSupabaseClient();
      const emailNormalized = formData.email.trim().toLowerCase();

      const { data: existingParticipant, error: existingError } = await supabase
        .from('participants')
        .select('id')
        .eq('email', emailNormalized)
        .maybeSingle();

      if (existingError) {
        setErrors({
          general: '참가 여부 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        });
        return;
      }

      if (existingParticipant) {
        setErrors({ email: '이미 참여한 이메일입니다. 다른 이메일을 사용해주세요.' });
        return;
      }

      const { data, error } = await supabase
        .from('participants')
        .insert({
          school_name: formData.schoolName.trim(),
          name: formData.name.trim(),
          email: emailNormalized,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          setErrors({ email: '이미 참여한 이메일입니다. 다른 이메일을 사용해주세요.' });
        } else {
          setErrors({ general: '등록 중 오류가 발생했습니다. 다시 시도해주세요.' });
        }
        return;
      }

      if (!data?.id) {
        setErrors({ general: '등록 응답이 올바르지 않습니다. 다시 시도해주세요.' });
        return;
      }

      flushSync(() => {
        resetAnswers();
        setParticipant({
          id: data.id,
          schoolName: data.school_name,
          name: data.name,
          email: data.email,
        });
      });

      router.push('/game/quiz');
    } catch (err) {
      console.error('[GameRegistration]', err);
      setErrors({ general: '네트워크 오류가 발생했습니다. 다시 시도해주세요.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const motionProps = prefersReducedMotion
    ? {}
    : { initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } };

  const schoolNameId = `${formId}-schoolName`;
  const schoolNameErrorId = `${formId}-schoolName-error`;
  const nameId = `${formId}-name`;
  const nameErrorId = `${formId}-name-error`;
  const emailId = `${formId}-email`;
  const emailErrorId = `${formId}-email-error`;
  const generalErrorId = `${formId}-general-error`;

  return (
    <motion.form
      {...motionProps}
      onSubmit={handleSubmit}
      aria-busy={isSubmitting}
      aria-describedby={errors.general ? generalErrorId : undefined}
      className="w-full max-w-md mx-auto game-card"
    >
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-black mb-1.5 sm:mb-2">참가자 등록</h2>
        <p className="text-black text-sm">
          퀴즈에 참여하기 위해 정보를 입력해주세요.
        </p>
      </div>

      {errors.general && (
        <div
          id={generalErrorId}
          role="alert"
          className="mb-5 sm:mb-6 p-3 sm:p-4 bg-yellow-300/20 border-l-4 border-yellow-300 rounded-lg text-black text-sm font-medium"
        >
          {errors.general}
        </div>
      )}

      <div className="space-y-4 sm:space-y-5">
        <div>
          <label htmlFor={schoolNameId} className="block text-sm font-medium text-black mb-1.5">
            학교명 (소속)
          </label>
          <input
            type="text"
            id={schoolNameId}
            value={formData.schoolName}
            onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
            autoComplete="organization"
            spellCheck="false"
            aria-invalid={!!errors.schoolName}
            aria-describedby={errors.schoolName ? schoolNameErrorId : undefined}
            className="game-input placeholder:text-black/45"
            placeholder="예: OO초등학교"
            disabled={isSubmitting}
          />
          {errors.schoolName && (
            <p id={schoolNameErrorId} className="mt-1.5 text-sm text-yellow-300 drop-shadow-sm" role="alert">
              {errors.schoolName}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={nameId} className="block text-sm font-medium text-black mb-1.5">
            이름
          </label>
          <input
            type="text"
            id={nameId}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            autoComplete="name"
            spellCheck="false"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? nameErrorId : undefined}
            className="game-input placeholder:text-black/45"
            placeholder="이름을 입력해주세요"
            disabled={isSubmitting}
          />
          {errors.name && (
            <p id={nameErrorId} className="mt-1.5 text-sm text-yellow-300 font-medium" role="alert">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={emailId} className="block text-sm font-medium text-black mb-1.5">
            이메일
          </label>
          <input
            type="email"
            id={emailId}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            autoComplete="email"
            spellCheck="false"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? emailErrorId : undefined}
            className="game-input placeholder:text-black/45"
            placeholder="example@email.com"
            disabled={isSubmitting}
          />
          {errors.email && (
            <p id={emailErrorId} className="mt-1.5 text-sm text-yellow-300 font-medium" role="alert">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="game-btn game-btn-primary w-full mt-6 sm:mt-8 py-3.5 sm:py-4 text-base sm:text-lg"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            등록 중...
          </span>
        ) : (
          '퀴즈 시작하기'
        )}
      </button>

      <p className="mt-3 sm:mt-4 text-center text-xs text-black">
        입력하신 정보는 퀴즈 진행 및 순위 표시에만 사용됩니다.
      </p>
    </motion.form>
  );
}
