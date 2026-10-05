'use client';

interface GameLandingVideoBackgroundProps {
  prefersReducedMotion: boolean;
}

export default function GameLandingVideoBackground({
  prefersReducedMotion,
}: GameLandingVideoBackgroundProps) {
  if (prefersReducedMotion) {
    return (
      <div
        className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-br from-emerald-900 via-green-900 to-amber-900"
        aria-hidden="true"
      />
    );
  }

  return (
    <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
      <video
        className="h-full w-full object-cover"
        src="/movie1.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/80 via-green-950/72 to-amber-950/78" />
    </div>
  );
}
