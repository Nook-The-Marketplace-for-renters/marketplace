import styles from './MinimalTopBar.module.css';

interface MinimalTopBarProps {
  onLogoClick?: () => void;
  actionLabel: string;
  onAction: () => void;
}

export function MinimalTopBar({ onLogoClick, actionLabel, onAction }: MinimalTopBarProps) {
  const LogoTag = onLogoClick ? 'button' : 'span';

  return (
    <header className={styles.topBar}>
      <div className={`${styles.topBarInner} container`}>
        <LogoTag className={styles.logo} onClick={onLogoClick}>
          <img src="/favicon.svg" className={styles.logoMark} alt="" aria-hidden="true" />
          Nook
        </LogoTag>
        <button className={styles.actionBtn} onClick={onAction}>
          {actionLabel}
        </button>
      </div>
    </header>
  );
}
