import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { fetchProfile, upsertOwnProfile } from '@/lib/api/profiles';
import type { OwnerProfile } from '@/types';

interface SessionContextValue {
  user: User | null;
  profile: OwnerProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<OwnerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(sessionUser: User) {
    let p = await fetchProfile(sessionUser.id);
    if (!p) {
      // No profile row (e.g. this account signed up before the auto-create
      // trigger existed) — create one now instead of leaving the account stuck.
      p = await upsertOwnProfile(sessionUser.id, {
        name: (sessionUser.user_metadata?.name as string | undefined) ?? sessionUser.email ?? 'Owner',
        email: sessionUser.email ?? '',
        picture: sessionUser.user_metadata?.picture as string | undefined,
      });
    }
    setProfile(p);
  }

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      const sessionUser = data.session?.user ?? null;
      setUser(sessionUser);
      if (sessionUser) loadProfile(sessionUser);
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
      if (sessionUser) {
        loadProfile(sessionUser);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  async function refreshProfile() {
    if (user) await loadProfile(user);
  }

  return (
    <SessionContext.Provider value={{ user, profile, loading, refreshProfile }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
