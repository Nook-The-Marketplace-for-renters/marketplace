import { useState } from 'react';
import styles from './AuthGate.module.css';
import { Modal } from './Modal';
import { Button } from '@/ui-kit';
import { signInWithPassword, signInWithOAuth, signUpWithPassword } from '@/lib/api/auth';
import { isValidEmail } from '@/lib/validate';

type Mode = 'signin' | 'signup';

interface AuthGateProps {
  onAuthenticated: () => void;
  onCancel: () => void;
}

export function AuthGate({ onAuthenticated, onCancel }: AuthGateProps) {
  const [mode, setMode] = useState<Mode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [confirmSent, setConfirmSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleOAuth(provider: 'google' | 'apple') {
    setError('');
    try {
      window.sessionStorage.setItem('loua-oauth-intent', 'onboarding');
      await signInWithOAuth(provider);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed. Try again.');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim().toLowerCase();
    if (!isValidEmail(trimmedEmail)) {
      setError('Enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'signup') {
        if (!name.trim()) {
          setError('Enter your full name.');
          return;
        }
        const { needsEmailConfirmation } = await signUpWithPassword(trimmedEmail, password, name.trim());
        if (needsEmailConfirmation) {
          setConfirmSent(true);
        } else {
          onAuthenticated();
        }
        return;
      }

      await signInWithPassword(trimmedEmail, password);
      onAuthenticated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmSent) {
    return (
      <Modal onClose={onCancel} closeLabel="Close">
        <h1 className={styles.title}>Check your email</h1>
        <p className={styles.subtitle}>
          We sent a confirmation link to {email.trim()}. Click it, then come back and sign in.
        </p>
        <Button variant="primary" size="md" onClick={onCancel}>
          Done
        </Button>
      </Modal>
    );
  }

  return (
    <Modal onClose={onCancel} closeLabel="Close">
      <h1 className={styles.title}>{mode === 'signin' ? 'Sign in to list your property' : 'Create your owner account'}</h1>
      <p className={styles.subtitle}>Owners need an account so renters know who they're dealing with.</p>

      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${mode === 'signin' ? styles.tabActive : ''}`}
          onClick={() => setMode('signin')}
        >
          Sign in
        </button>
        <button
          type="button"
          className={`${styles.tab} ${mode === 'signup' ? styles.tabActive : ''}`}
          onClick={() => setMode('signup')}
        >
          Sign up
        </button>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {mode === 'signup' && (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className={styles.input}
            aria-label="Full name"
          />
        )}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className={styles.input}
          aria-label="Email"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className={styles.input}
          aria-label="Password"
        />
        {error && <p className={styles.error}>{error}</p>}
        <Button type="submit" variant="primary" size="md" disabled={submitting}>
          {mode === 'signin' ? 'Sign in' : 'Create account'}
        </Button>
      </form>

      <div className={styles.divider}>
        <span>or continue with</span>
      </div>

      <div className={styles.providers}>
        <Button variant="outline" size="md" onClick={() => handleOAuth('google')}>
          <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 44c5.4 0 10.3-2.1 14-5.4l-6.5-5.5c-2 1.5-4.6 2.4-7.5 2.4-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.6 39.6 16.3 44 24 44z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.5 5.5C39.9 37 44 31.4 44 24c0-1.3-.1-2.7-.4-3.5z" />
          </svg>
          Continue with Google
        </Button>
        <button type="button" className={styles.appleBtn} onClick={() => handleOAuth('apple')}>
          <svg width="16" height="16" viewBox="0 0 384 512" fill="currentColor" aria-hidden="true">
            <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
          </svg>
          Continue with Apple
        </button>
      </div>
    </Modal>
  );
}
