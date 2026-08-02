import './card.css';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
  as?: keyof JSX.IntrinsicElements;
}

export function Card({ children, className = '', elevated = false, as = 'div' }: CardProps) {
  const Tag = as as any;
  const classes = ['nk-card', elevated ? 'nk-card--elevated' : '', className]
    .filter(Boolean)
    .join(' ');
  return <Tag className={classes}>{children}</Tag>;
}
