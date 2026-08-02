import './badge.css';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'accent' | 'dark';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const classes = ['nk-badge', `nk-badge--${variant}`, className].filter(Boolean).join(' ');
  return <span className={classes}>{children}</span>;
}
