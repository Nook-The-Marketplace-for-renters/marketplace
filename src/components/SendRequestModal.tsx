import { useState } from 'react';
import styles from './SendRequestModal.module.css';
import { Modal } from './Modal';
import { Button } from '@/ui-kit';
import { useLanguage } from '@/i18n/LanguageContext';
import { isValidEmail } from '@/lib/validate';
import type { Lead } from '@/types';

interface SendRequestModalProps {
  listingTitle: string;
  onSubmit: (lead: Lead) => Promise<void>;
  onClose: () => void;
}

export function SendRequestModal({ listingTitle, onSubmit, onClose }: SendRequestModalProps) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !isValidEmail(email)) return;
    setSending(true);
    setError('');
    try {
      await onSubmit({ name: name.trim(), email: email.trim(), message: message.trim() || undefined, createdAt: new Date().toISOString() });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send your request. Try again.');
    } finally {
      setSending(false);
    }
  }

  return (
    <Modal onClose={onClose} closeLabel={t.detail.close} maxWidth={400}>
      {sent ? (
        <div className={styles.sent}>
          <span className={styles.sentCheck}>✓</span>
          <h2 className={styles.title}>{t.request.sentTitle}</h2>
          <p className={styles.subtitle}>{t.request.sentBody}</p>
          <Button variant="primary" size="md" onClick={onClose}>
            {t.request.close}
          </Button>
        </div>
      ) : (
        <>
          <h2 className={styles.title}>{t.request.title}</h2>
          <p className={styles.subtitle}>{listingTitle}</p>
          <form className={styles.form} onSubmit={handleSubmit}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.request.name}
              className={styles.input}
              aria-label={t.request.name}
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.request.email}
              className={styles.input}
              aria-label={t.request.email}
            />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t.request.messagePlaceholder}
              className={styles.textarea}
              rows={3}
              aria-label={t.request.message}
            />
            {error && <p className={styles.error}>{error}</p>}
            <Button type="submit" variant="primary" size="md" disabled={sending}>
              {sending ? '…' : t.request.submit}
            </Button>
          </form>
        </>
      )}
    </Modal>
  );
}
