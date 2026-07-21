'use client';

import React, { createContext, useContext, useState } from 'react';

interface AuthContextValue {
  user: { email: string; name: string } | null;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: { email: 'demo@cargoiq.io', name: 'Demo User' },
  isAuthenticated: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user] = useState({ email: 'demo@cargoiq.io', name: 'Demo User' });

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: true }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
