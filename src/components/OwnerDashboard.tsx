import styles from './OwnerDashboard.module.css';
import { ListingPhotoView } from './ListingPhotoView';
import { MinimalTopBar } from './MinimalTopBar';
import { Button } from '@/ui-kit';
import { useLanguage } from '@/i18n/LanguageContext';
import type { Lead, Listing } from '@/types';

interface OwnerDashboardProps {
  ownerName: string;
  listings: Listing[];
  requests: Record<string, Lead[]>;
  onBack: () => void;
  onListAnother: () => void;
  onSignOut: () => void;
  onDelete: (listingId: string) => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function OwnerDashboard({
  ownerName,
  listings,
  requests,
  onBack,
  onListAnother,
  onSignOut,
  onDelete,
}: OwnerDashboardProps) {
  const { t } = useLanguage();
  const d = t.dashboard;

  function handleDelete(listing: Listing) {
    if (window.confirm(d.deleteConfirm(listing.title))) {
      onDelete(listing.id);
    }
  }

  return (
    <div className={styles.page}>
      <MinimalTopBar onLogoClick={onBack} actionLabel={d.signOut} onAction={onSignOut} />

      <main className={`${styles.content} container`}>
        <div className={styles.headRow}>
          <div>
            <p className={styles.signedInAs}>{ownerName}</p>
            <h1 className={styles.title}>{d.title}</h1>
            <p className={styles.subtitle}>{d.subtitle}</p>
          </div>
          <div className={styles.headActions}>
            <Button variant="outline" size="md" onClick={onBack}>
              {d.back}
            </Button>
            <Button variant="primary" size="md" onClick={onListAnother}>
              {d.listAnother}
            </Button>
          </div>
        </div>

        {listings.length === 0 ? (
          <p className={styles.empty}>{d.empty}</p>
        ) : (
          <div className={styles.list}>
            {listings.map((listing) => {
              const leads = requests[listing.id] ?? [];
              return (
                <article key={listing.id} className={styles.card}>
                  <div className={styles.cardMain}>
                    {listing.photos[0] && (
                      <ListingPhotoView photo={listing.photos[0]} className={styles.thumb} />
                    )}
                    <div className={styles.cardInfo}>
                      <h2 className={styles.cardTitle}>{listing.title}</h2>
                      <p className={styles.cardMeta}>
                        {listing.address} · {listing.neighbourhood} · ${listing.priceMonthly.toLocaleString()}{' '}
                        {t.card.perMonth}
                      </p>
                      <span className={styles.leadCount}>
                        {leads.length > 0 ? d.interested(leads.length) : d.noInterest}
                      </span>
                    </div>
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(listing)}
                      aria-label={d.delete}
                    >
                      {d.delete}
                    </button>
                  </div>

                  {leads.length > 0 && (
                    <ul className={styles.leadList}>
                      {leads.map((lead, i) => (
                        <li key={i} className={styles.lead}>
                          <div className={styles.leadHead}>
                            <span className={styles.leadName}>{lead.name}</span>
                            <span className={styles.leadDate}>{formatDate(lead.createdAt)}</span>
                          </div>
                          <span className={styles.leadEmail}>{lead.email}</span>
                          {lead.message && <p className={styles.leadMessage}>{lead.message}</p>}
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
