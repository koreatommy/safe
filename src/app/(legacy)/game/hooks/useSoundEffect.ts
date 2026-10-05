'use client';

import { useCallback, useRef, useState, useEffect } from 'react';

type SoundType = 'correct' | 'wrong' | 'tick' | 'complete';

const SOUND_URLS: Record<SoundType, string> = {
  correct: '/sounds/correct.mp3',
  wrong: '/sounds/wrong.mp3',
  tick: '/sounds/tick.mp3',
  complete: '/sounds/complete.mp3',
};

export function useSoundEffect() {
  const [isMuted, setIsMuted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBuffersRef = useRef<Map<SoundType, AudioBuffer>>(new Map());
  const htmlAudioRef = useRef<Map<SoundType, HTMLAudioElement>>(new Map());
  const isLoadedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedMuted = localStorage.getItem('game-sound-muted');
    if (savedMuted === 'true') {
      setIsMuted(true);
    }

    const initAudio = async () => {
      try {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

        const htmlAudioMap = new Map<SoundType, HTMLAudioElement>();
        (Object.entries(SOUND_URLS) as [SoundType, string][]).forEach(([key, url]) => {
          const audio = new Audio(url);
          audio.preload = 'auto';
          htmlAudioMap.set(key, audio);
        });
        htmlAudioRef.current = htmlAudioMap;
        
        const loadPromises = Object.entries(SOUND_URLS).map(async ([key, url]) => {
          try {
            const response = await fetch(url);
            if (!response.ok) return;
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audioContextRef.current!.decodeAudioData(arrayBuffer);
            audioBuffersRef.current.set(key as SoundType, audioBuffer);
          } catch {
            console.warn(`Failed to load sound: ${key}`);
          }
        });

        await Promise.all(loadPromises);
        isLoadedRef.current = true;
      } catch {
        console.warn('Web Audio API not supported');
      }
    };

    initAudio();

    const unlockAudio = async () => {
      try {
        if (audioContextRef.current?.state === 'suspended') {
          await audioContextRef.current.resume();
        }
      } catch {
        // ignore unlock errors; fallback audio will still try to play
      }
    };

    const unlockEvents: Array<keyof WindowEventMap> = ['touchstart', 'pointerdown', 'keydown'];
    unlockEvents.forEach(eventName => {
      window.addEventListener(eventName, unlockAudio, { passive: true });
    });

    return () => {
      unlockEvents.forEach(eventName => {
        window.removeEventListener(eventName, unlockAudio);
      });

      htmlAudioRef.current.forEach(audio => {
        audio.pause();
        audio.src = '';
      });
      htmlAudioRef.current.clear();

      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const playSound = useCallback((type: SoundType) => {
    if (isMuted) return;

    const playHtmlFallback = () => {
      const fallbackAudio = htmlAudioRef.current.get(type);
      if (!fallbackAudio) return;

      fallbackAudio.currentTime = 0;
      fallbackAudio.volume = type === 'complete' ? 0.7 : 0.5;
      void fallbackAudio.play().catch(() => {
        console.warn(`Failed to play fallback sound: ${type}`);
      });
    };

    const audioContext = audioContextRef.current;
    if (!audioContext || !isLoadedRef.current) {
      playHtmlFallback();
      return;
    }

    const buffer = audioBuffersRef.current.get(type);
    if (!buffer) {
      playHtmlFallback();
      return;
    }

    try {
      const startBufferPlayback = () => {
      const source = audioContext.createBufferSource();
      source.buffer = buffer;

      const gainNode = audioContext.createGain();
      gainNode.gain.value = type === 'complete' ? 0.7 : 0.5;

      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
      source.start(0);
      };

      if (audioContext.state === 'suspended') {
        void audioContext
          .resume()
          .then(startBufferPlayback)
          .catch(() => playHtmlFallback());
        return;
      }

      startBufferPlayback();
    } catch {
      playHtmlFallback();
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newValue = !prev;
      localStorage.setItem('game-sound-muted', String(newValue));
      return newValue;
    });
  }, []);

  const playCorrect = useCallback(() => playSound('correct'), [playSound]);
  const playWrong = useCallback(() => playSound('wrong'), [playSound]);
  const playTick = useCallback(() => playSound('tick'), [playSound]);
  const playComplete = useCallback(() => playSound('complete'), [playSound]);

  return {
    isMuted,
    toggleMute,
    playCorrect,
    playWrong,
    playTick,
    playComplete,
    playSound,
  };
}
