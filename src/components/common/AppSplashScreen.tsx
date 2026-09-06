import React, { useState, useEffect } from 'react';
import { Building2, Sparkles } from 'lucide-react';

interface AppSplashScreenProps {
  onComplete: () => void;
  durationMs?: number;
}

export const AppSplashScreen: React.FC<AppSplashScreenProps> = ({ 
  onComplete, 
  durationMs = 2200 
}) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Begin exit transition slightly before duration finishes
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, durationMs - 450);

    // Complete and unmount
    const finishTimer = setTimeout(() => {
      onComplete();
    }, durationMs);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [durationMs, onComplete]);

  const handleFastSkip = () => {
    setIsExiting(true);
    setTimeout(onComplete, 200);
  };

  return (
    <div 
      onClick={handleFastSkip}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#07070a] overflow-hidden select-none cursor-pointer transition-all duration-500 ease-out ${
        isExiting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      aria-label="App Loading Screen (Click to skip)"
      title="Click anywhere to skip intro"
    >
      {/* ── Ambient Background Glows ── */}
      <div className="absolute w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute w-[450px] h-[450px] bg-teal-500/15 rounded-full blur-[100px] pointer-events-none -top-24 -right-24 animate-float-slow" />
      <div className="absolute w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[90px] pointer-events-none -bottom-20 -left-20 animate-float-med" />

      {/* ── Central Animated Logo Stage ── */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-md w-full">
        
        {/* Emblem Container with Multi-Layer Glow and Rings */}
        <div className="relative mb-6 flex items-center justify-center">
          {/* Outer Pulsing Expanding Auras */}
          <div 
            style={{ borderRadius: '9999px' }}
            className="absolute w-52 h-52 bg-gradient-to-tr from-secondary/25 to-interactive-primary/25 blur-2xl animate-aura-1" 
          />
          <div 
            style={{ borderRadius: '9999px' }}
            className="absolute w-52 h-52 bg-gradient-to-br from-teal-400/25 to-indigo-500/25 blur-xl animate-aura-2" 
          />

          {/* Outer Rotating Dashed Ring */}
          <div 
            style={{ borderRadius: '9999px' }}
            className="absolute w-44 h-44 border border-dashed border-secondary/50 animate-ring-spin" 
          />

          {/* Counter-Rotating Fine Ring with Accent Glowing Orbs */}
          <div 
            style={{ borderRadius: '9999px' }}
            className="absolute w-48 h-48 border border-interactive-primary/40 animate-ring-spin-reverse"
          >
            <span 
              style={{ borderRadius: '9999px' }}
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-secondary-fixed shadow-[0_0_10px_#50d8e9]" 
            />
            <span 
              style={{ borderRadius: '9999px' }}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-interactive-primary shadow-[0_0_10px_#5e6bff]" 
            />
          </div>

          {/* Circular Emblem Frame */}
          <div 
            style={{ borderRadius: '9999px' }}
            className="relative w-32 h-32 sm:w-36 sm:h-36 p-1 bg-gradient-to-tr from-interactive-primary/50 via-secondary/40 to-interactive-primary/50 shadow-[0_0_50px_rgba(80,216,233,0.45)] backdrop-blur-md animate-logo-reveal"
          >
            <div 
              style={{ borderRadius: '9999px' }}
              className="w-full h-full bg-[#0d0f17] p-1 border border-white/20 flex items-center justify-center overflow-hidden"
            >
              <img 
                style={{ borderRadius: '9999px' }}
                src="/logo.png" 
                alt="Vishnu Wellness Centre Logo" 
                className="w-full h-full object-cover drop-shadow-2xl"
              />
            </div>
          </div>
        </div>

        {/* ── Title & Institutional Typography ── */}
        <div className="animate-text-emerge space-y-2 mt-2">
          <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-white flex items-center justify-center gap-2">
            <span>VISHNU</span>
            <span className="bg-gradient-to-r from-secondary-fixed via-teal-300 to-interactive-primary bg-clip-text text-transparent">
              WELLNESS CENTRE
            </span>
          </h1>

          <p className="text-xs sm:text-sm font-bold tracking-widest uppercase text-teal-200/90">
            Empowering Minds • Inspiring Lives
          </p>

          <div className="pt-2 flex items-center justify-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/80 text-xs shadow-inner">
              <Building2 size={13} className="text-secondary-fixed" />
              <span className="font-medium tracking-wide">Sri Vishnu Educational Society</span>
            </div>
          </div>
        </div>

        {/* ── Bottom Progress Beam ── */}
        <div className="mt-10 w-48 sm:w-56 h-1 rounded-full bg-white/10 overflow-hidden relative shadow-inner">
          <div className="h-full bg-gradient-to-r from-interactive-primary via-secondary to-teal-300 rounded-full animate-progress-load shadow-[0_0_12px_#50d8e9]" />
        </div>

        <div className="mt-3 flex items-center gap-1 text-[11px] font-mono text-white/40 tracking-wider">
          <Sparkles size={11} className="text-secondary-fixed/60 animate-pulse" />
          <span>Initializing secure clinical portal...</span>
        </div>
      </div>
    </div>
  );
};
