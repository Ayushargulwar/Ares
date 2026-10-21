import React from 'react';

interface AresLogoProps {
  className?: string;
  size?: number;
}

export const AresLogo: React.FC<AresLogoProps> = ({ className = "w-10 h-10", size = 40 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer Shield / 'A' Network Structure (Navy Blue) */}
      <path
        d="M 50 12 L 80 28 L 72 65 L 50 88 L 28 65 L 20 28 Z"
        stroke="#0F2537"
        strokeWidth="4"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Nodes at Outer Vertices */}
      <circle cx="50" cy="12" r="4.5" fill="#0F2537" />
      <circle cx="80" cy="28" r="4.5" fill="#0F2537" />
      <circle cx="20" cy="28" r="4.5" fill="#0F2537" />
      <circle cx="72" cy="65" r="4.5" fill="#0F2537" />
      <circle cx="28" cy="65" r="4.5" fill="#0F2537" />
      <circle cx="50" cy="88" r="4.5" fill="#0F2537" />

      {/* Inner Central Allocation Hub (Cyan) */}
      <circle cx="50" cy="40" r="7" stroke="#00B4D8" strokeWidth="3.5" fill="white" />
      <circle cx="50" cy="40" r="3" fill="#00B4D8" />

      {/* Radiating Resource Arrows (Cyan) */}
      {/* Arrow Down */}
      <path d="M 50 47 L 50 72" stroke="#00B4D8" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M 45 66 L 50 73 L 55 66" stroke="#00B4D8" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Arrow Down-Left */}
      <path d="M 44 45 L 26 60" stroke="#00B4D8" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M 25 53 L 24 61 L 32 61" stroke="#00B4D8" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Arrow Down-Right */}
      <path d="M 56 45 L 74 60" stroke="#00B4D8" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M 68 61 L 76 61 L 75 53" stroke="#00B4D8" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Bottom Connected Node Chain (Navy Blue) */}
      <path
        d="M 38 68 L 50 78 L 62 68"
        stroke="#0F2537"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="38" cy="68" r="4" fill="#0F2537" />
      <circle cx="62" cy="68" r="4" fill="#0F2537" />
    </svg>
  );
};
