import styles from './ListingGrid.module.css';
import { ListingCard } from './ListingCard';
import { useLanguage } from '@/i18n/LanguageContext';
import type { Listing } from '@/types';

interface ListingGridProps {
  listings: Listing[];
  savedIds: Set<string>;
  onToggleSave: (id: string) => void;
  onOpen: (id: string) => void;
}

export function ListingGrid({ listings, savedIds, onToggleSave, onOpen }: ListingGridProps) {
  const { t } = useLanguage();

  if (listings.length === 0) {
    return (
      <div className={`${styles.empty} container`}>
        <p>{t.card.noMatches}</p>
      </div>
    );
  }

  return (
    <div className={`${styles.grid} container`}>
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          saved={savedIds.has(listing.id)}
          onToggleSave={onToggleSave}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}
