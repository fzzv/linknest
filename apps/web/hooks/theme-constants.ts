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

const DEFAULT_THEME: ThemeName = 'dark';

const isValidTheme = (value: unknown): value is ThemeName =>
  typeof value === 'string' && (DAISY_THEMES as readonly string[]).includes(value);

export { THEME_STORAGE_KEY, DAISY_THEMES, DEFAULT_THEME, isValidTheme };
export type { ThemeName };
