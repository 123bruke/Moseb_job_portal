import { useId } from "react";

interface IconAProps {
  size?: number;
  className?: string;
  glow?: boolean;
}

/**
 * Moseb brand glyph representing Moseb AI Assistant.
 * Designed with the signature architectural 'M' emblem in forest green.
 */
export default function IconA({ size = 24, className = "", glow = false }: IconAProps) {
  const gradId = useId();

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {glow && (
        <span
          className="absolute inset-0 rounded-full blur-md opacity-60 animate-pulse pointer-events-none bg-[#147D4A]"
          aria-hidden="true"
        />
      )}
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative transform transition-transform duration-300"
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22C55E" />
            <stop offset="100%" stopColor="#147D4A" />
          </linearGradient>
        </defs>
        <rect width="24" height="24" rx="6" fill={`url(#${gradId})`} />
        <path
          d="M4 18V7L12 14L20 7V18"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M12 4.5L16 8.5" stroke="white" strokeWidth="1.8" opacity="0.6" strokeLinecap="round" />
      </svg>
    </div>
  );
}
