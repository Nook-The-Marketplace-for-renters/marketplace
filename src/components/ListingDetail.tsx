import { useState } from 'react';
import styles from './ListingDetail.module.css';
import { ListingPhotoView } from './ListingPhotoView';
import { LocationMap } from './LocationMap';
import { SendRequestModal } from './SendRequestModal';
import { AskLouAiPanel } from './AskLouAiPanel';
import { Modal } from './Modal';
import { Button, Badge } from '@/ui-kit';
import { useLanguage } from '@/i18n/LanguageContext';
import type { Lead, Listing } from '@/types';

interface ListingDetailProps {
  listing: Listing;
  onClose: () => void;
  onSendRequest: (listingId: string, lead: Lead) => Promise<void>;
}

export function ListingDetail({ listing, onClose, onSendRequest }: ListingDetailProps) {
  const { t } = useLanguage();
  const [requestOpen, setRequestOpen] = useState(false);
  const [askAiOpen, setAskAiOpen] = useState(false);

  return (
    <>
      <Modal
        onClose={onClose}
        closeLabel={t.detail.close}
        maxWidth={720}
        align="top"
        floatingClose
        noPadding
        zIndex={200}
        ariaLabel={listing.title}
      >
        <div className={styles.gallery}>
          {listing.photos.map((photo, i) => (
            <ListingPhotoView key={i} photo={photo} className={styles.galleryPane} />
          ))}
        </div>

        <div className={styles.content}>
          <div className={styles.headRow}>
            <div>
              <h2 className={styles.title}>{listing.title}</h2>
              <p className={styles.address}>{listing.address}</p>
              <p className={styles.meta}>
                {listing.neighbourhood} · {t.propertyTypes[listing.type]} · {listing.unitSize} · {listing.baths}{' '}
                {t.card.bath}
              </p>
            </div>
            <div className={styles.ratingBlock}>
              {listing.reviews > 0 ? (
                <>
                  <span className={styles.ratingValue}>★ {listing.rating.toFixed(2)}</span>
                  <span className={styles.ratingCount}>
                    {listing.reviews} {t.detail.reviews}
                  </span>
                </>
              ) : (
                <span className={styles.ratingValue}>{t.card.new}</span>
              )}
            </div>
          </div>

          {listing.favorite && <Badge variant="accent">{t.card.guestFavorite}</Badge>}

          <p className={styles.description}>{listing.description}</p>

          <div className={styles.amenities}>
            {listing.tags.map((tag) => (
              <span key={tag} className={styles.amenity}>
                {t.tags[tag] ?? tag}
              </span>
            ))}
          </div>

          <LocationMap neighbourhood={listing.neighbourhood} />

          {(listing.petPolicy || listing.leaseTerm) && (
            <div className={styles.details}>
              {listing.petPolicy && (
                <p>
                  <strong>{t.detail.petPolicy}</strong> {listing.petPolicy}
                </p>
              )}
              {listing.leaseTerm && (
                <p>
                  <strong>{t.detail.leaseTerm}</strong> {listing.leaseTerm}
                </p>
              )}
            </div>
          )}

          {listing.owner && (
            <div className={styles.owner}>
              {listing.owner.picture && <img src={listing.owner.picture} alt="" className={styles.ownerAvatar} />}
              <div>
                <p className={styles.ownerName}>
                  {t.detail.hostedBy} {listing.owner.name}
                </p>
                <p className={styles.ownerEmail}>{listing.owner.email}</p>
              </div>
            </div>
          )}

          <div className={styles.footer}>
            <div className={styles.priceBlock}>
              <span className={styles.price}>${listing.priceMonthly.toLocaleString()} CAD</span>
              <span className={styles.priceSub}>
                {t.detail.perMonth} · {listing.available}
              </span>
            </div>
            <div className={styles.actions}>
              <Button variant="outline" size="md" onClick={() => setAskAiOpen(true)}>
                {t.detail.askAI}
              </Button>
              <Button variant="primary" size="md" onClick={() => setRequestOpen(true)}>
                {t.detail.sendRequest}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {requestOpen && (
        <SendRequestModal
          listingTitle={listing.title}
          onClose={() => setRequestOpen(false)}
          onSubmit={(lead) => onSendRequest(listing.id, lead)}
        />
      )}

      {askAiOpen && (
        <AskLouAiPanel listingId={listing.id} listingAddress={listing.address} onClose={() => setAskAiOpen(false)} />
      )}
    </>
  );
}
