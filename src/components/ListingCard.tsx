import { useState } from 'react';
import styles from './ListingCard.module.css';
import { ListingPhotoView } from './ListingPhotoView';
import { useLanguage } from '@/i18n/LanguageContext';
import type { Listing } from '@/types';

interface ListingCardProps {
  listing: Listing;
  saved: boolean;
  onToggleSave: (id: string) => void;
  onOpen: (id: string) => void;
}

export function ListingCard({ listing, saved, onToggleSave, onOpen }: ListingCardProps) {
  const { t } = useLanguage();
  const [photoIndex, setPhotoIndex] = useState(0);
  const hasMultiple = listing.photos.length > 1;

  function step(delta: number, e: React.MouseEvent) {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev + delta + listing.photos.length) % listing.photos.length);
  }

  const photo = listing.photos[photoIndex];

  return (
    <article className={styles.card}>
      <div
        className={styles.photo}
        onClick={() => onOpen(listing.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onOpen(listing.id)}
      >
        <ListingPhotoView photo={photo} className={styles.photoMedia} />

        {listing.favorite && <span className={styles.favoriteBadge}>{t.card.guestFavorite}</span>}

        <button
          className={`${styles.saveBtn} ${saved ? styles.saveBtnActive : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(listing.id);
          }}
          aria-label={saved ? t.card.unsave : t.card.save}
          aria-pressed={saved}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
            <path d="M12 21s-7.5-4.6-10-9.3C.5 8 2.3 4 6.2 4c2 0 3.6 1.1 4.5 2.5C11.6 5.1 13.2 4 15.2 4 19.1 4 21 8 19.5 11.7 17.5 16.4 12 21 12 21z" />
          </svg>
        </button>

        {hasMultiple && (
          <>
            <button className={`${styles.navBtn} ${styles.navPrev}`} onClick={(e) => step(-1, e)} aria-label={t.card.prevPhoto}>
              ‹
            </button>
            <button className={`${styles.navBtn} ${styles.navNext}`} onClick={(e) => step(1, e)} aria-label={t.card.nextPhoto}>
              ›
            </button>
            <div className={styles.dots}>
              {listing.photos.map((_, i) => (
                <span key={i} className={`${styles.dot} ${i === photoIndex ? styles.dotActive : ''}`} />
              ))}
            </div>
          </>
        )}
      </div>

      <div
        className={styles.body}
        onClick={() => onOpen(listing.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onOpen(listing.id)}
      >
        <div className={styles.headRow}>
          <span className={styles.title}>{listing.title}</span>
          <span className={styles.rating}>
            {listing.reviews > 0 ? (
              <>
                <span aria-hidden="true">★</span> {listing.rating.toFixed(2)}
              </>
            ) : (
              t.card.new
            )}
          </span>
        </div>
        <p className={styles.meta}>
          {listing.neighbourhood} · {listing.unitSize} · {listing.baths} {t.card.bath}
        </p>
        <div className={styles.tags}>
          {listing.tags.slice(0, 2).map((tag) => (
            <span key={tag} className={styles.tag}>
              {t.tags[tag] ?? tag}
            </span>
          ))}
        </div>
        <p className={styles.price}>
          <strong>${listing.priceMonthly.toLocaleString()}</strong> {t.card.perMonth}
        </p>
      </div>
    </article>
  );
}
