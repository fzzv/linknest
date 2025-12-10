'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const THEME_STORAGE_KEY = 'linknest-theme';

const DAISY_THEMES = [
  'bumblebee',
  'retro',
  'halloween',
  'lofi',
  'garden',
  'coffee',
  'fantasy',
  'aqua',
  'pastel',
  'light',
  'synthwave',
  'emerald',
  'cupcake',
  'dark',
  'night',
  'silk',
  'acid',
  'business',
  'cyberpunk',
  'dim',
  'nord',
  'corporate',
  'cmyk',
  'valentine',
  'abyss',
  'wireframe',
  'black',
  'forest',
  'caramellatte',
  'lemonade',
  'dracula',
  'winter',
  'sunset',
  'luxury',
  'autumn',
] as const;

type ThemeName = (typeof DAISY_THEMES)[number];

type ThemeContextValue = {
  theme: ThemeName;
  setTheme: (value: ThemeName) => void;
  themes: typeof DAISY_THEMES;
};

const DEFAULT_THEME: ThemeName = 'dark';

const ThemeContext = createContext<ThemeContextValue | null>(null);

const isValidTheme = (value: unknown): value is ThemeName =>
  typeof value === 'string' && (DAISY_THEMES as readonly string[]).includes(value);

const getInitialTheme = (): ThemeName => {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return isValidTheme(stored) ? stored : DEFAULT_THEME;
};

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<ThemeName>(getInitialTheme);

  useEffect(() => {
    const nextTheme = isValidTheme(theme) ? theme : DEFAULT_THEME;
    document.documentElement.setAttribute('data-theme', nextTheme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // ignore write errors (e.g., private mode)
    }
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
