'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  THEME_STORAGE_KEY,
  DAISY_THEMES,
  DEFAULT_THEME,
  isValidTheme,
  type ThemeName,
} from './theme-constants';

type ThemeContextValue = {
  theme: ThemeName;
  setTheme: (value: ThemeName) => void;
  themes: typeof DAISY_THEMES;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

type ThemeProviderProps = {
  children: React.ReactNode;
  initialTheme?: ThemeName;
};

const ThemeProvider = ({ children, initialTheme }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<ThemeName>(() => {
    if (typeof document !== 'undefined') {
      const domTheme = document.documentElement.getAttribute('data-theme');
      if (isValidTheme(domTheme)) {
        return domTheme;
      }
    }
    return initialTheme ?? DEFAULT_THEME;
  });

  useEffect(() => {
    // Read persisted theme after mount to avoid SSR/client mismatches
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (isValidTheme(stored)) {
      setTheme(stored);
    }
  }, []);

  useEffect(() => {
    const nextTheme = isValidTheme(theme) ? theme : DEFAULT_THEME;
    document.documentElement.setAttribute('data-theme', nextTheme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      document.cookie = `${THEME_STORAGE_KEY}=${nextTheme}; path=/; max-age=31536000; samesite=lax`;
    } catch { }
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      themes: DAISY_THEMES,
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export { DAISY_THEMES, DEFAULT_THEME, ThemeProvider, useTheme };
export type { ThemeName };
