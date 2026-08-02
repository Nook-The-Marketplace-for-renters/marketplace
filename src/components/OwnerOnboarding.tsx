import { useRef, useState } from 'react';
import styles from './OwnerOnboarding.module.css';
import { MinimalTopBar } from './MinimalTopBar';
import { Button } from '@/ui-kit';
import { useLanguage } from '@/i18n/LanguageContext';
import { isValidEmail } from '@/lib/validate';
import { createListing } from '@/lib/api/listings';
import { uploadListingPhotos } from '@/lib/api/storage';
import { updateProfile } from '@/lib/api/profiles';
import type { Listing, PropertyType } from '@/types';

const PROPERTY_TYPES: PropertyType[] = ['Apartment', 'Condo', 'Loft', 'House', 'Studio'];

const AMENITIES = [
  'Pets OK',
  'Furnished',
  'Heat incl.',
  'Parking',
  'Balcony',
  'AC',
  'Elevator',
  'Near metro',
  'Laundry in-unit',
];

interface DraftPhoto {
  file: File;
  previewUrl: string;
}

interface Draft {
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerPicture: string;
  title: string;
  address: string;
  neighbourhood: string;
  type: PropertyType;
  unitSize: string;
  baths: string;
  sqft: string;
  photos: DraftPhoto[];
  description: string;
  tags: string[];
  petPolicy: string;
  leaseTerm: string;
  priceMonthly: string;
  available: string;
}

const EMPTY_DRAFT: Draft = {
  ownerName: '',
  ownerEmail: '',
  ownerPhone: '',
  ownerPicture: '',
  title: '',
  address: '',
  neighbourhood: '',
  type: 'Apartment',
  unitSize: '',
  baths: '',
  sqft: '',
  photos: [],
  description: '',
  tags: [],
  petPolicy: '',
  leaseTerm: '',
  priceMonthly: '',
  available: '',
};

interface OwnerOnboardingProps {
  ownerId: string;
  onPublish: (listing: Listing) => void;
  onExit: () => void;
  initialOwner?: Partial<Pick<Draft, 'ownerName' | 'ownerEmail' | 'ownerPhone' | 'ownerPicture'>>;
}

export function OwnerOnboarding({ ownerId, onPublish, onExit, initialOwner }: OwnerOnboardingProps) {
  const { t } = useLanguage();
  const o = t.onboarding;
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>({ ...EMPTY_DRAFT, ...initialOwner });
  const [published, setPublished] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function toggleTag(tag: string) {
    setDraft((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }));
  }

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    const newPhotos: DraftPhoto[] = Array.from(fileList).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setDraft((prev) => ({ ...prev, photos: [...prev.photos, ...newPhotos] }));
  }

  function removePhoto(index: number) {
    setDraft((prev) => {
      URL.revokeObjectURL(prev.photos[index].previewUrl);
      return { ...prev, photos: prev.photos.filter((_, i) => i !== index) };
    });
  }

  function stepValid(i: number): boolean {
    switch (i) {
      case 0:
        return draft.ownerName.trim().length > 0 && isValidEmail(draft.ownerEmail);
      case 1:
        return (
          draft.title.trim().length > 0 &&
          draft.address.trim().length > 0 &&
          draft.neighbourhood.trim().length > 0 &&
          draft.unitSize.trim().length > 0 &&
          Number(draft.baths) > 0
        );
      case 2:
        return draft.photos.length > 0;
      case 3:
        return draft.description.trim().length > 0;
      case 4:
        return Number(draft.priceMonthly) > 0 && draft.available.trim().length > 0;
      default:
        return true;
    }
  }

  async function handlePublish() {
    setPublishing(true);
    setPublishError('');
    try {
      if (draft.ownerName.trim() || draft.ownerPhone.trim()) {
        await updateProfile(ownerId, { name: draft.ownerName.trim(), phone: draft.ownerPhone.trim() || undefined });
      }

      const photos = await uploadListingPhotos(
        draft.photos.map((p) => p.file),
        ownerId
      );

      const listing = await createListing({
        title: draft.title.trim(),
        address: draft.address.trim(),
        neighbourhood: draft.neighbourhood.trim(),
        type: draft.type,
        unitSize: draft.unitSize.trim(),
        baths: Number(draft.baths),
        sqft: draft.sqft ? Number(draft.sqft) : undefined,
        priceMonthly: Number(draft.priceMonthly),
        tags: draft.tags,
        photos,
        available: draft.available.trim(),
        description: draft.description.trim(),
        petPolicy: draft.petPolicy.trim() || undefined,
        leaseTerm: draft.leaseTerm.trim() || undefined,
      });

      onPublish(listing);
      setPublished(true);
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : 'Something went wrong publishing your listing.');
    } finally {
      setPublishing(false);
    }
  }

  if (published) {
    return (
      <div className={styles.page}>
        <div className={`${styles.success} container`}>
          <span className={styles.successCheck}>✓</span>
          <h1 className={styles.successTitle}>{o.successTitle}</h1>
          <p className={styles.successBody}>{o.successBody(draft.title)}</p>
          <Button variant="primary" size="lg" onClick={onExit}>
            {o.successCta}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <MinimalTopBar onLogoClick={onExit} actionLabel={o.exit} onAction={onExit} />

      <div className={styles.progress}>
        <div className={styles.progressTrack} style={{ width: `${((step + 1) / o.steps.length) * 100}%` }} />
      </div>

      <main className={styles.content}>
        <p className={styles.stepLabel}>{o.step(step + 1, o.steps.length)}</p>
        <h1 className={styles.stepTitle}>{o.steps[step]}</h1>

        {step === 0 && (
          <div className={styles.form}>
            {draft.ownerPicture && (
              <img src={draft.ownerPicture} alt="" className={styles.avatar} />
            )}
            <p className={styles.hint}>{o.profileConfirmHint}</p>
            <label className={styles.field}>
              <span>{o.fields.fullName}</span>
              <input value={draft.ownerName} onChange={(e) => update('ownerName', e.target.value)} placeholder="Jordan Tremblay" />
            </label>
            <label className={styles.field}>
              <span>{o.fields.email}</span>
              <input type="email" value={draft.ownerEmail} readOnly className={styles.readOnlyInput} />
            </label>
            <label className={styles.field}>
              <span>{o.fields.phone}</span>
              <input value={draft.ownerPhone} onChange={(e) => update('ownerPhone', e.target.value)} placeholder="(514) 555-0100" />
            </label>
          </div>
        )}

        {step === 1 && (
          <div className={styles.form}>
            <label className={styles.field}>
              <span>{o.fields.title}</span>
              <input value={draft.title} onChange={(e) => update('title', e.target.value)} placeholder="Sunlit 4½ near the metro" />
            </label>
            <label className={styles.field}>
              <span>{o.fields.address}</span>
              <input
                value={draft.address}
                onChange={(e) => update('address', e.target.value)}
                placeholder="840 Rue Rachel Est"
              />
            </label>
            <label className={styles.field}>
              <span>{o.fields.neighbourhood}</span>
              <input
                value={draft.neighbourhood}
                onChange={(e) => update('neighbourhood', e.target.value)}
                placeholder="Le Plateau-Mont-Royal"
              />
            </label>
            <div className={styles.fieldRow}>
              <label className={styles.field}>
                <span>{o.fields.propertyType}</span>
                <select value={draft.type} onChange={(e) => update('type', e.target.value as PropertyType)}>
                  {PROPERTY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {t.propertyTypes[type]}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.field}>
                <span>{o.fields.unitSize}</span>
                <input value={draft.unitSize} onChange={(e) => update('unitSize', e.target.value)} placeholder="4½" />
              </label>
            </div>
            <div className={styles.fieldRow}>
              <label className={styles.field}>
                <span>{o.fields.bathrooms}</span>
                <input
                  type="number"
                  min="1"
                  value={draft.baths}
                  onChange={(e) => update('baths', e.target.value)}
                  placeholder="1"
                />
              </label>
              <label className={styles.field}>
                <span>{o.fields.sqft}</span>
                <input
                  type="number"
                  min="0"
                  value={draft.sqft}
                  onChange={(e) => update('sqft', e.target.value)}
                  placeholder="750"
                />
              </label>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={styles.form}>
            <p className={styles.hint}>{o.photosHint}</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className={styles.fileInput}
              onChange={(e) => handleFiles(e.target.files)}
            />
            <button type="button" className={styles.uploadZone} onClick={() => fileInputRef.current?.click()}>
              <span className={styles.uploadIcon}>+</span>
              {o.uploadCta}
            </button>

            {draft.photos.length > 0 && (
              <div className={styles.photoGrid}>
                {draft.photos.map((photo, i) => (
                  <div key={i} className={styles.photoThumb}>
                    <img src={photo.previewUrl} alt={photo.file.name} />
                    <button
                      type="button"
                      className={styles.photoRemove}
                      onClick={() => removePhoto(i)}
                      aria-label={o.removePhoto(i + 1)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className={styles.form}>
            <label className={styles.field}>
              <span>{o.fields.description}</span>
              <textarea
                value={draft.description}
                onChange={(e) => update('description', e.target.value)}
                placeholder="Tell renters what makes this place worth living in."
                rows={4}
              />
            </label>
            <div className={styles.field}>
              <span>{o.fields.amenities}</span>
              <div className={styles.checkGrid}>
                {AMENITIES.map((tag) => (
                  <label key={tag} className={styles.checkItem}>
                    <input type="checkbox" checked={draft.tags.includes(tag)} onChange={() => toggleTag(tag)} />
                    {t.tags[tag] ?? tag}
                  </label>
                ))}
              </div>
            </div>
            <label className={styles.field}>
              <span>{o.fields.petPolicy}</span>
              <input
                value={draft.petPolicy}
                onChange={(e) => update('petPolicy', e.target.value)}
                placeholder="Small pets welcome with deposit"
              />
            </label>
            <label className={styles.field}>
              <span>{o.fields.leaseTerm}</span>
              <input
                value={draft.leaseTerm}
                onChange={(e) => update('leaseTerm', e.target.value)}
                placeholder="12-month lease, renewable"
              />
            </label>
          </div>
        )}

        {step === 4 && (
          <div className={styles.form}>
            <label className={styles.field}>
              <span>{o.fields.monthlyRent}</span>
              <input
                type="number"
                min="0"
                value={draft.priceMonthly}
                onChange={(e) => update('priceMonthly', e.target.value)}
                placeholder="1650"
              />
            </label>
            <label className={styles.field}>
              <span>{o.fields.availability}</span>
              <input
                value={draft.available}
                onChange={(e) => update('available', e.target.value)}
                placeholder="Available now, or Available Sept 1"
              />
            </label>
          </div>
        )}

        {step === 5 && (
          <div className={styles.review}>
            {draft.photos[0] && <img src={draft.photos[0].previewUrl} alt="" className={styles.reviewPhoto} />}
            <h2 className={styles.reviewTitle}>{draft.title || o.untitled}</h2>
            {draft.address && <p className={styles.reviewAddress}>{draft.address}</p>}
            <p className={styles.reviewMeta}>
              {draft.neighbourhood} · {t.propertyTypes[draft.type]} · {draft.unitSize} · {draft.baths} {t.card.bath}
              {draft.sqft && ` · ${draft.sqft} sqft`}
            </p>
            <p className={styles.reviewPrice}>
              ${Number(draft.priceMonthly || 0).toLocaleString()} {t.card.perMonth} · {draft.available}
            </p>
            <p className={styles.reviewDescription}>{draft.description}</p>
            {draft.tags.length > 0 && (
              <div className={styles.reviewTags}>
                {draft.tags.map((tag) => (
                  <span key={tag} className={styles.reviewTag}>
                    {t.tags[tag] ?? tag}
                  </span>
                ))}
              </div>
            )}
            <p className={styles.reviewOwner}>
              {o.listedBy} {draft.ownerName} · {draft.ownerEmail}
            </p>
            {publishError && <p className={styles.publishError}>{publishError}</p>}
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <Button variant="ghost" size="md" onClick={() => setStep((s) => Math.max(0, s - 1))} className={step === 0 ? styles.hidden : ''}>
            {o.back}
          </Button>
          {step < o.steps.length - 1 ? (
            <Button variant="primary" size="md" onClick={() => setStep((s) => s + 1)} className={!stepValid(step) ? styles.disabled : ''}>
              {o.continueBtn}
            </Button>
          ) : (
            <Button variant="primary" size="md" onClick={handlePublish} disabled={publishing}>
              {publishing ? '…' : o.publish}
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
