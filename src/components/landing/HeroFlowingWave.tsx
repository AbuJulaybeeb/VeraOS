import React from "react";

export const HeroFlowingWave: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={"absolute inset-0 overflow-hidden pointer-events-none select-none " + className} aria-hidden="true">
      {/* Top radiant amber glow aura */}
      <div 
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] rounded-full opacity-50 blur-[130px]"
        style={{
          background: "radial-gradient(circle, rgba(224,138,62,0.65) 0%, rgba(201,106,43,0.35) 45%, rgba(22,12,8,0) 75%)",
        }}
      />

      {/* Secondary right warm ambient glow */}
      <div 
        className="absolute top-10 -right-20 w-[650px] h-[650px] rounded-full opacity-35 blur-[140px]"
        style={{
          background: "radial-gradient(circle, rgba(255,87,8,0.5) 0%, rgba(140,43,0,0.2) 50%, rgba(22,12,8,0) 75%)",
        }}
      />

      {/* Flowing Silk Wave Vector Paths matching Stitch screenshot */}
      <svg
        className="absolute inset-0 w-full h-full opacity-70 mix-blend-screen"
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="silkWave1" x1="0%" y1="10%" x2="100%" y2="90%">
            <stop offset="0%" stopColor="#E08A3E" stopOpacity="0.08" />
            <stop offset="30%" stopColor="#FF8A3D" stopOpacity="0.5" />
            <stop offset="55%" stopColor="#C96A2B" stopOpacity="0.65" />
            <stop offset="75%" stopColor="#FF5708" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#21110B" stopOpacity="0.0" />
          </linearGradient>

          <linearGradient id="silkWave2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFB95F" stopOpacity="0.0" />
            <stop offset="25%" stopColor="#E08A3E" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#D87431" stopOpacity="0.6" />
            <stop offset="80%" stopColor="#A64205" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#160C08" stopOpacity="0.0" />
          </linearGradient>

          <linearGradient id="silkWave3" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#FFE0B2" stopOpacity="0.1" />
            <stop offset="40%" stopColor="#E08A3E" stopOpacity="0.45" />
            <stop offset="70%" stopColor="#9E3800" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#160C08" stopOpacity="0.0" />
          </linearGradient>

          <filter id="waveBlurSoft" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>

        {/* Ambient background ribbon */}
        <path
          d="M-100,280 C240,120 480,480 820,240 C1120,40 1340,320 1550,220 L1550,900 L-100,900 Z"
          fill="url(#silkWave1)"
          filter="url(#waveBlurSoft)"
          opacity="0.6"
        />

        {/* Flowing Ribbon Layer 2 - Sweeping curves across center */}
        <path
          d="M-50,380 C180,240 420,540 760,340 C1060,160 1300,420 1500,280"
          stroke="url(#silkWave1)"
          strokeWidth="38"
          strokeLinecap="round"
          opacity="0.8"
        />
        <path
          d="M-50,380 C180,240 420,540 760,340 C1060,160 1300,420 1500,280"
          stroke="#FFB95F"
          strokeWidth="2.5"
          strokeOpacity="0.6"
        />

        {/* Flowing Ribbon Layer 3 - Elegant twisting silk bands */}
        <path
          d="M50,180 C320,380 620,160 940,380 C1220,580 1380,240 1520,340"
          stroke="url(#silkWave2)"
          strokeWidth="52"
          strokeLinecap="round"
          opacity="0.7"
        />
        <path
          d="M50,180 C320,380 620,160 940,380 C1220,580 1380,240 1520,340"
          stroke="#FFE5B4"
          strokeWidth="2"
          strokeOpacity="0.5"
        />

        {/* Additional fine dynamic ribbon threads for realistic silk sheen */}
        <path
          d="M-120,460 C150,320 380,620 740,420 C1080,240 1320,520 1580,360"
          stroke="url(#silkWave3)"
          strokeWidth="22"
          opacity="0.6"
        />
        <path
          d="M200,80 C440,280 720,80 1020,300 C1260,480 1420,180 1560,260"
          stroke="url(#silkWave1)"
          strokeWidth="16"
          opacity="0.45"
        />
        <path
          d="M-80,560 C260,420 540,700 880,500 C1180,320 1400,580 1600,440"
          stroke="url(#silkWave2)"
          strokeWidth="30"
          opacity="0.55"
        />
      </svg>

      {/* Subtle bottom vignette to transition seamlessly to the problem section */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
        style={{
          background: "linear-gradient(to top, #160C08 30%, rgba(22,12,8,0) 100%)",
        }}
      />
    </div>
  );
};
