'use client';

import React, { createContext, useContext, useState } from 'react';
import { useAuth as useClerkAuth } from '@clerk/nextjs';
import { useUser } from '@clerk/nextjs';

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
  const { userId } = useClerkAuth();
  const { user } = useUser();

  const resolvedUser = userId && user
    ? { email: user.emailAddresses[0]?.emailAddress || '', name: user.fullName || user.firstName || '' }
    : null;

  return (
    <AuthContext.Provider value={{ user: resolvedUser, isAuthenticated: !!userId, isLoading: true }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
