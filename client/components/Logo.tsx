import { cn } from "@/lib/utils";

export default function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="LinguaTrack Fox"
      className={cn("w-6 h-6", className)}
    >
      <defs>
        <linearGradient id="fox-gradient" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#FF8C42" />
          <stop offset="100%" stopColor="#FF6B35" />
        </linearGradient>
      </defs>
      
      {/* Fox ears */}
      <path
        d="M18 12 L24 24 L12 28 Z M46 12 L40 24 L52 28 Z"
        fill="url(#fox-gradient)"
      />
      
      {/* Fox face */}
      <ellipse
        cx="32"
        cy="35"
        rx="18"
        ry="16"
        fill="url(#fox-gradient)"
      />
      
      {/* White chest patch */}
      <ellipse
        cx="32"
        cy="44"
        rx="10"
        ry="8"
        fill="white"
        opacity="0.9"
      />
      
      {/* Eyes */}
      <circle cx="26" cy="32" r="3" fill="#2D3748" />
      <circle cx="38" cy="32" r="3" fill="#2D3748" />
      
      {/* Eye sparkles */}
      <circle cx="27" cy="31" r="1" fill="white" />
      <circle cx="39" cy="31" r="1" fill="white" />
      
      {/* Cute nose */}
      <path
        d="M32 38 Q30 40, 28 39 Q32 41, 36 39 Q34 40, 32 38 Z"
        fill="#2D3748"
      />
      
      {/* Smile */}
      <path
        d="M28 41 Q32 43, 36 41"
        stroke="#2D3748"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
