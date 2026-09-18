'use client';

import React, { createContext, useContext } from 'react';
import { useAuth as useClerkAuth, useUser } from '@clerk/nextjs';

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

function ClerkAuthProvider({ children }: { children: React.ReactNode }) {
  const { userId } = useClerkAuth();
  const { user } = useUser();

  const resolvedUser = userId && user
    ? {
        email: user.emailAddresses[0]?.emailAddress || '',
        name: user.fullName || user.firstName || '',
      }
    : null;

  return (
    <AuthContext.Provider
      value={{
        user: resolvedUser,
        isAuthenticated: !!userId,
        isLoading: true,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({
  children,
  bypassAuth = false,
}: {
  children: React.ReactNode;
  bypassAuth?: boolean;
}) {
  if (bypassAuth) {
    return (
      <AuthContext.Provider
        value={{ user: null, isAuthenticated: false, isLoading: false }}
      >
        {children}
      </AuthContext.Provider>
    );
  }

  return <ClerkAuthProvider>{children}</ClerkAuthProvider>;
}

export function useAuthContext() {
  return useContext(AuthContext);
}
