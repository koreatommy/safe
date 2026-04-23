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

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const playSound = useCallback((type: SoundType) => {
    if (isMuted || !audioContextRef.current || !isLoadedRef.current) return;

    const buffer = audioBuffersRef.current.get(type);
    if (!buffer) return;

    try {
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }

      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      
      const gainNode = audioContextRef.current.createGain();
      gainNode.gain.value = type === 'complete' ? 0.7 : 0.5;
      
      source.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      source.start(0);
    } catch {
      console.warn(`Failed to play sound: ${type}`);
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
