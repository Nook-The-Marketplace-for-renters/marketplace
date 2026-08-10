import { useEffect, useRef, useState } from 'react';
import styles from './FilterBar.module.css';
import { useLanguage } from '@/i18n/LanguageContext';
import type { Listing } from '@/types';

export interface FilterDef {
  id: string;
  label: string;
  test: (listing: Listing) => boolean;
}

export const FILTERS: FilterDef[] = [
  { id: 'favorite', label: 'Guest favorites', test: (l) => Boolean(l.favorite) },
  { id: 'apartment', label: 'Apartments', test: (l) => l.type === 'Apartment' },
  { id: 'loft', label: 'Lofts', test: (l) => l.type === 'Loft' },
  { id: 'condo', label: 'Condos', test: (l) => l.type === 'Condo' },
  { id: 'house', label: 'Houses', test: (l) => l.type === 'House' },
  { id: 'studio', label: 'Studios', test: (l) => l.type === 'Studio' },
  { id: 'pets', label: 'Pet friendly', test: (l) => l.tags.includes('Pets OK') },
  { id: 'furnished', label: 'Furnished', test: (l) => l.tags.includes('Furnished') },
  { id: 'heat', label: 'Heat included', test: (l) => l.tags.includes('Heat incl.') },
  { id: 'parking', label: 'Parking', test: (l) => l.tags.includes('Parking') },
  { id: 'budget', label: 'Under $1,500', test: (l) => l.priceMonthly < 1500 },
];

interface FilterBarProps {
  active: string | null;
  onToggle: (id: string) => void;
  onClear: () => void;
}

export function FilterBar({ active, onToggle, onClear }: FilterBarProps) {
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

  const activeFilter = FILTERS.find((f) => f.id === active) ?? null;

  function select(id: string) {
    onToggle(id);
    setOpen(false);
  }

  function selectAll() {
    onClear();
    setOpen(false);
  }

  return (
    <div className={styles.bar}>
      <div className={`${styles.inner} container`} ref={ref}>
        <button
          type="button"
          className={`${styles.trigger} ${activeFilter ? styles.triggerActive : ''}`}
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          {activeFilter ? t.filters[activeFilter.id] ?? activeFilter.label : t.filterBar.label}
          <svg className={styles.chevron} width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {open && (
          <div className={styles.dropdown} role="listbox">
            <button
              type="button"
              role="option"
              aria-selected={activeFilter === null}
              className={`${styles.option} ${activeFilter === null ? styles.optionActive : ''}`}
              onClick={selectAll}
            >
              {t.filterBar.all}
            </button>
            {FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                role="option"
                aria-selected={active === filter.id}
                className={`${styles.option} ${active === filter.id ? styles.optionActive : ''}`}
                onClick={() => select(filter.id)}
              >
                {t.filters[filter.id] ?? filter.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
