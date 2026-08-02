import styles from './FilterBar.module.css';
import { useLanguage } from '@/i18n/LanguageContext';
import type { Listing } from '@/types';

export interface FilterDef {
  id: string;
  label: string;
  icon: string;
  test: (listing: Listing) => boolean;
}

export const FILTERS: FilterDef[] = [
  { id: 'favorite', label: 'Guest favorites', icon: '⭐', test: (l) => Boolean(l.favorite) },
  { id: 'apartment', label: 'Apartments', icon: '🏢', test: (l) => l.type === 'Apartment' },
  { id: 'loft', label: 'Lofts', icon: '🎨', test: (l) => l.type === 'Loft' },
  { id: 'condo', label: 'Condos', icon: '🏙️', test: (l) => l.type === 'Condo' },
  { id: 'house', label: 'Houses', icon: '🏡', test: (l) => l.type === 'House' },
  { id: 'studio', label: 'Studios', icon: '🛏️', test: (l) => l.type === 'Studio' },
  { id: 'pets', label: 'Pet friendly', icon: '🐾', test: (l) => l.tags.includes('Pets OK') },
  { id: 'furnished', label: 'Furnished', icon: '🛋️', test: (l) => l.tags.includes('Furnished') },
  { id: 'heat', label: 'Heat included', icon: '🔥', test: (l) => l.tags.includes('Heat incl.') },
  { id: 'parking', label: 'Parking', icon: '🚗', test: (l) => l.tags.includes('Parking') },
  { id: 'budget', label: 'Under $1,500', icon: '💰', test: (l) => l.priceMonthly < 1500 },
];

interface FilterBarProps {
  active: string | null;
  onToggle: (id: string) => void;
}

export function FilterBar({ active, onToggle }: FilterBarProps) {
  const { t } = useLanguage();

  return (
    <div className={styles.bar}>
      <div className={`${styles.track} container`}>
        {FILTERS.map((filter) => (
          <button
            key={filter.id}
            className={`${styles.pill} ${active === filter.id ? styles.pillActive : ''}`}
            onClick={() => onToggle(filter.id)}
            aria-pressed={active === filter.id}
          >
            <span aria-hidden="true">{filter.icon}</span>
            {t.filters[filter.id] ?? filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}
