interface LogoProps {
  className?: string;
  variant?: 'dark' | 'light';
}

export function Logo({ className, variant = 'dark' }: LogoProps) {
  const ink = variant === 'light' ? 'var(--color-warm-white)' : 'var(--color-charcoal)';

  return (
    <svg viewBox="0 0 540 220" className={className} aria-hidden="true">
      <line x1="55" y1="40" x2="55" y2="188" stroke={ink} strokeWidth="34" strokeLinecap="round" />
      <circle cx="175" cy="142" r="48" fill="none" stroke={ink} strokeWidth="34" />
      <path
        d="M128 95 L175 42 L222 95"
        fill="none"
        stroke="var(--color-brick)"
        strokeWidth="30"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="157" y="128" width="36" height="42" rx="10" fill="var(--color-brick)" />
      <path
        d="M290 95 V150 Q290 178 318 178 H322 Q350 178 350 150 V95"
        fill="none"
        stroke={ink}
        strokeWidth="34"
        strokeLinecap="round"
      />
      <circle cx="435" cy="150" r="40" fill="none" stroke={ink} strokeWidth="34" />
      <line x1="480" y1="95" x2="480" y2="188" stroke={ink} strokeWidth="34" strokeLinecap="round" />
    </svg>
  );
}
