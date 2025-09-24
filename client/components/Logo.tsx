import { cn } from "@/lib/utils";

export default function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={cn("w-6 h-6", className)}
    >
      <defs>
        <linearGradient id="lg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="url(#lg)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 44v6a2 2 0 0 0 3.3 1.6L28 44h18a10 10 0 0 0 10-10V22a10 10 0 0 0-10-10H18A10 10 0 0 0 8 22v12a10 10 0 0 0 4 8Z"/>
        <circle cx="32" cy="8" r="3"/>
        <line x1="32" y1="11" x2="32" y2="12.5"/>
        <circle cx="25" cy="28" r="2.5"/>
        <circle cx="39" cy="28" r="2.5"/>
      </g>
    </svg>
  );
}
