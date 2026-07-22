'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createAuthClient } from 'better-auth/client';

const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

interface AuthContextValue {
  user: { email: string; name: string } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthContextValue['user']>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const session = await authClient.getSession();
        if (!active) return;
        if (session?.user) {
          setUser({ email: session.user.email, name: session.user.name });
        }
      } catch {
        // ignore session fetch errors
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => { active = false; };
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
