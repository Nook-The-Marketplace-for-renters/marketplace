import { useEffect, useRef, useState } from 'react';
import styles from './Header.module.css';
import { Button } from '@/ui-kit';
import { useLanguage } from '@/i18n/LanguageContext';

interface HeaderProps {
  query: string;
  onQueryChange: (value: string) => void;
  onListProperty: () => void;
  isSignedIn: boolean;
  onMyListings: () => void;
  onSignOut: () => void;
}

function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      type="button"
      className={styles.langToggle}
      onClick={toggleLanguage}
      aria-label={language === 'en' ? 'Switch to French' : 'Passer en anglais'}
    >
      <span className={language === 'en' ? styles.langActive : ''}>EN</span>
      <span className={styles.langDivider}>/</span>
      <span className={language === 'fr' ? styles.langActive : ''}>FR</span>
    </button>
  );
}

function AccountMenu({ onMyListings, onSignOut }: { onMyListings: () => void; onSignOut: () => void }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div className={styles.accountMenu} ref={ref}>
      <button
        type="button"
        className={styles.menuToggle}
        onClick={() => setOpen((v) => !v)}
        aria-label={t.header.accountMenu}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span />
        <span />
        <span />
      </button>
      {open && (
        <div className={styles.menuDropdown} role="menu">
          <button
            type="button"
            role="menuitem"
            className={styles.menuItem}
            onClick={() => {
              setOpen(false);
              onMyListings();
            }}
          >
            {t.header.myListings}
          </button>
          <button
            type="button"
            role="menuitem"
            className={styles.menuItem}
            onClick={() => {
              setOpen(false);
              onSignOut();
            }}
          >
            {t.dashboard.signOut}
          </button>
        </div>
      )}
    </div>
  );
}

export function Header({ query, onQueryChange, onListProperty, isSignedIn, onMyListings, onSignOut }: HeaderProps) {
  const { t } = useLanguage();

  return (
    <header className={styles.header}>
      <div className={`${styles.inner} container`}>
        <a href="#" className={styles.logo} aria-label={t.header.homeAria}>
          <img src="/favicon.svg" className={styles.logoMark} alt="" aria-hidden="true" />
          <span>
            Nook<span className={styles.logoSub}>{t.header.tagline}</span>
          </span>
        </a>

        <div className={styles.searchBar}>
          <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M11.5 11.5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={t.header.searchPlaceholder}
            className={styles.searchInput}
            aria-label={t.header.searchAria}
          />
          <span className={styles.searchDivider} aria-hidden="true" />
          <span className={styles.searchLocation}>{t.header.location}</span>
        </div>

        <div className={styles.actions}>
          <LanguageToggle />
          {isSignedIn && <AccountMenu onMyListings={onMyListings} onSignOut={onSignOut} />}
          <Button variant="outline" size="sm" onClick={onListProperty} className={styles.listCta}>
            {t.header.listCta}
          </Button>
        </div>
      </div>
    </header>
  );
}
