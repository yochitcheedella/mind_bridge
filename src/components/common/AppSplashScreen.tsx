import React, { useState, useEffect } from 'react';

interface AppSplashScreenProps {
  onComplete: () => void;
  durationMs?: number;
}

export const AppSplashScreen: React.FC<AppSplashScreenProps> = ({ 
  onComplete, 
  durationMs = 1500 
}) => {
  const [phase, setPhase] = useState<'enter' | 'pulse' | 'exit'>('enter');

  useEffect(() => {
    // Phase 1: enter & scale up (0 - 400ms)
    // Phase 2: gentle luminous pulse & settle (400ms - 1100ms)
    const pulseTimer = setTimeout(() => {
      setPhase('pulse');
    }, 350);

    // Phase 3: smooth exit fade transition (1100ms - 1500ms)
    const exitTimer = setTimeout(() => {
      setPhase('exit');
    }, durationMs - 400);

    // Completion
    const finishTimer = setTimeout(() => {
      onComplete();
    }, durationMs);

    return () => {
      clearTimeout(pulseTimer);
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [durationMs, onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#080811] select-none transition-all duration-500 ease-out ${
        phase === 'exit' ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* ── Soft Ambient Radial Glow ── */}
      <div 
        className={`absolute w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-indigo-600/20 via-purple-600/15 to-cyan-500/20 blur-[90px] pointer-events-none transition-all duration-1000 ${
          phase === 'pulse' ? 'scale-115 opacity-100' : 'scale-90 opacity-60'
        }`} 
      />

      {/* ── Logo Stage ── */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        
        {/* Glowing Logo Frame */}
        <div className="relative mb-6 flex items-center justify-center">
          {/* Subtle Halo */}
          <div 
            className={`absolute w-36 h-36 rounded-full bg-cyan-400/20 blur-xl transition-all duration-700 ease-out ${
              phase === 'pulse' ? 'scale-125 opacity-80' : 'scale-95 opacity-0'
            }`} 
          />

          {/* Core Brandmark */}
          <div 
            className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl p-1 bg-gradient-to-tr from-indigo-500/30 via-cyan-400/30 to-purple-500/30 shadow-[0_0_40px_rgba(99,102,241,0.35)] transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) ${
              phase === 'enter' 
                ? 'scale-85 opacity-0 -translate-y-2' 
                : phase === 'pulse'
                ? 'scale-100 opacity-100 translate-y-0'
                : 'scale-105 opacity-90'
            }`}
          >
            <div className="w-full h-full rounded-[22px] bg-[#0c0d18] p-3 border border-white/10 flex items-center justify-center overflow-hidden">
              <img 
                src="/logo.svg" 
                alt="MindBridge AI" 
                className="w-full h-full object-contain drop-shadow-md"
              />
            </div>
          </div>
        </div>

        {/* ── Brand Typography ── */}
        <div 
          className={`space-y-1.5 transition-all duration-700 delay-150 ${
            phase === 'enter' 
              ? 'opacity-0 translate-y-3' 
              : 'opacity-100 translate-y-0'
          }`}
        >
          <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-white flex items-center justify-center gap-1.5">
            <span>Mind</span>
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
              Bridge
            </span>
          </h1>

          <p className="text-[11px] sm:text-xs font-medium tracking-widest uppercase text-on-surface-variant/80">
            Anonymous • Safe • Empathetic
          </p>
        </div>

      </div>
    </div>
  );
};
