'use client';

import { ApolloProvider } from '@apollo/client';
import { client } from '@/lib/apollo-client';
import { ReactNode, useEffect, useState, createContext, useContext } from 'react';

// Script-free Theme Orchestration for React 19
const ThemeContext = createContext({
  theme: 'dark',
  setTheme: (t: string) => {}
});

export const useTheme = () => useContext(ThemeContext);

export function Providers({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState('dark');
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('prosync-theme') || 'dark';
    setTheme(saved);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('prosync-theme', theme);
  }, [theme, mounted]);

  return (
    <ApolloProvider client={client}>
      <ThemeContext.Provider value={{ theme, setTheme }}>
        {children}
      </ThemeContext.Provider>
    </ApolloProvider>
  );
}
