import { useEffect, useMemo, useState } from 'react';
import styles from './App.module.css';
import { Button } from '@/ui-kit';
import { Header } from '@/components/Header';
import { FilterBar, FILTERS } from '@/components/FilterBar';
import { ListingGrid } from '@/components/ListingGrid';
import { ListingDetail } from '@/components/ListingDetail';
import { AuthGate } from '@/components/AuthGate';
import { OwnerOnboarding } from '@/components/OwnerOnboarding';
import { OwnerDashboard } from '@/components/OwnerDashboard';
import { useLanguage } from '@/i18n/LanguageContext';
import { useSession } from '@/session/SessionContext';
import { SUPABASE_ENABLED } from '@/lib/supabaseClient';
import { deleteListing, fetchListings, fetchMyListings } from '@/lib/api/listings';
import { fetchRequestsForListings, createRequest } from '@/lib/api/requests';
import { signOut } from '@/lib/api/auth';
import { FILLER_LISTINGS } from '@/data/listings';
import type { Lead, Listing } from '@/types';

type View = 'browse' | 'auth' | 'onboarding' | 'dashboard';

export function App() {
  const { t } = useLanguage();
  const { user, profile, loading: sessionLoading } = useSession();
  const [view, setView] = useState<View>('browse');
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [openId, setOpenId] = useState<string | null>(null);
  // Filler listings show immediately so the marketplace never looks empty;
  // real ones (once the backend has data) are prepended ahead of them.
  const [listings, setListings] = useState<Listing[]>(FILLER_LISTINGS);
  const [requests, setRequests] = useState<Record<string, Lead[]>>({});

  useEffect(() => {
    let cancelled = false;
    fetchListings()
      .then((data) => !cancelled && data.length > 0 && setListings([...data, ...FILLER_LISTINGS]))
      .catch((err) => console.error('Failed to load listings (showing filler only)', err));
    return () => {
      cancelled = true;
    };
  }, []);

  // A "list your property" click before sign-in stashes intent so an OAuth
  // redirect round-trip still lands back on the onboarding wizard.
  useEffect(() => {
    if (user && window.sessionStorage.getItem('loua-oauth-intent') === 'onboarding') {
      window.sessionStorage.removeItem('loua-oauth-intent');
      setView('onboarding');
    }
  }, [user]);

  const [myListings, setMyListings] = useState<Listing[]>([]);

  useEffect(() => {
    if (view !== 'dashboard' || !user) return;
    fetchMyListings()
      .then((data) => {
        setMyListings(data);
        return data.length > 0 ? fetchRequestsForListings(data.map((l) => l.id)) : {};
      })
      .then(setRequests)
      .catch((err) => console.error('Failed to load dashboard data', err));
  }, [view, user]);

  // If the profile never arrives (e.g. the database schema hasn't been
  // applied yet), stop spinning silently and say so after a few seconds.
  const [profileTimedOut, setProfileTimedOut] = useState(false);

  const profileGatedView = view === 'dashboard' || view === 'onboarding';

  useEffect(() => {
    if (!profileGatedView || profile) {
      setProfileTimedOut(false);
      return;
    }
    const timer = setTimeout(() => setProfileTimedOut(true), 4000);
    return () => clearTimeout(timer);
  }, [profileGatedView, profile]);

  function renderProfileLoading() {
    return (
      <div className={styles.configError}>
        {profileTimedOut ? (
          <>
            <h1>Couldn't load your account</h1>
            <p>
              This usually means the database schema hasn't been applied yet — run{' '}
              <code>supabase/schema.sql</code> in your Supabase project's SQL Editor.
            </p>
            <Button variant="outline" size="md" onClick={() => setView('browse')}>
              Back to marketplace
            </Button>
          </>
        ) : (
          <p>Loading your account…</p>
        )}
      </div>
    );
  }

  const filtered = useMemo(() => {
    const filterDef = FILTERS.find((f) => f.id === activeFilter);
    const q = query.trim().toLowerCase();
    return listings.filter((listing) => {
      if (filterDef && !filterDef.test(listing)) return false;
      if (!q) return true;
      return (
        listing.title.toLowerCase().includes(q) ||
        listing.neighbourhood.toLowerCase().includes(q)
      );
    });
  }, [listings, query, activeFilter]);

  function toggleSave(id: string) {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleFilter(id: string) {
    setActiveFilter((prev) => (prev === id ? null : id));
  }

  function clearFilter() {
    setActiveFilter(null);
  }

  function handlePublished(listing: Listing) {
    setListings((prev) => [listing, ...prev]);
  }

  function handleListProperty() {
    setView(user ? 'onboarding' : 'auth');
  }

  async function handleSendRequest(listingId: string, lead: Lead) {
    await createRequest(listingId, lead);
  }

  async function handleSignOut() {
    await signOut();
    setView('browse');
  }

  async function handleDeleteListing(listingId: string) {
    await deleteListing(listingId);
    setListings((prev) => prev.filter((l) => l.id !== listingId));
    setMyListings((prev) => prev.filter((l) => l.id !== listingId));
    setRequests((prev) => {
      const next = { ...prev };
      delete next[listingId];
      return next;
    });
  }

  const openListing = listings.find((l) => l.id === openId) ?? null;

  if (!SUPABASE_ENABLED) {
    return (
      <div className={styles.configError}>
        <h1>Backend not configured</h1>
        <p>
          This app needs <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> set in{' '}
          <code>.env</code> to run.
        </p>
      </div>
    );
  }

  if (view === 'auth') {
    return (
      <>
        <Header
          query={query}
          onQueryChange={setQuery}
          onListProperty={handleListProperty}
          isSignedIn={Boolean(user)}
          onMyListings={() => setView('dashboard')}
          onSignOut={handleSignOut}
        />
        <FilterBar active={activeFilter} onToggle={toggleFilter} onClear={clearFilter} />
        <AuthGate onAuthenticated={() => setView('onboarding')} onCancel={() => setView('browse')} />
      </>
    );
  }

  if (view === 'onboarding') {
    if (sessionLoading || !user) return null;
    // Wait for the profile to load before mounting the form: OwnerOnboarding
    // seeds its draft state from initialOwner only once, on mount, so
    // rendering it early (with initialOwner still undefined) would leave the
    // read-only email field permanently blank — which fails step 1's
    // validation and makes "Continue" un-clickable for good.
    if (!profile) return renderProfileLoading();
    return (
      <OwnerOnboarding
        ownerId={user.id}
        onPublish={handlePublished}
        onExit={() => setView('browse')}
        initialOwner={{
          ownerName: profile.name,
          ownerEmail: profile.email,
          ownerPhone: profile.phone ?? '',
          ownerPicture: profile.picture ?? '',
        }}
      />
    );
  }

  if (view === 'dashboard') {
    if (!user) {
      // Shouldn't normally happen (the menu item only shows when signed in),
      // but fail safe rather than silently rendering nothing.
      return (
        <>
          <Header
            query={query}
            onQueryChange={setQuery}
            onListProperty={handleListProperty}
            isSignedIn={false}
            onMyListings={() => setView('dashboard')}
            onSignOut={handleSignOut}
          />
          <AuthGate onAuthenticated={() => setView('onboarding')} onCancel={() => setView('browse')} />
        </>
      );
    }
    if (!profile) return renderProfileLoading();
    return (
      <OwnerDashboard
        ownerName={profile.name}
        listings={myListings}
        requests={requests}
        onBack={() => setView('browse')}
        onListAnother={() => setView('onboarding')}
        onSignOut={handleSignOut}
        onDelete={handleDeleteListing}
      />
    );
  }

  return (
    <>
      <Header
        query={query}
        onQueryChange={setQuery}
        onListProperty={handleListProperty}
        isSignedIn={Boolean(user)}
        onMyListings={() => setView('dashboard')}
        onSignOut={handleSignOut}
      />
      <FilterBar active={activeFilter} onToggle={toggleFilter} onClear={clearFilter} />
      <main>
        <div className={`${styles.resultsLine} container`}>
          {t.results(filtered.length)}
        </div>
        <ListingGrid
          listings={filtered}
          savedIds={savedIds}
          onToggleSave={toggleSave}
          onOpen={setOpenId}
        />
      </main>
      {openListing && (
        <ListingDetail listing={openListing} onClose={() => setOpenId(null)} onSendRequest={handleSendRequest} />
      )}
    </>
  );
}
