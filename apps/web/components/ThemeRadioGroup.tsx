'use client';

import { cn } from '@linknest/utils';
import type { ThemeName } from '@/hooks/useTheme';

type ThemeRadioGroupProps = {
  value?: ThemeName;
  onChange?: (value: ThemeName) => void;
  themes: readonly ThemeName[];
};

const PREVIEW_COLORS = ['primary', 'secondary', 'accent', 'neutral'] as const;

const toLabel = (name: string) => name.charAt(0).toUpperCase() + name.slice(1);

const ThemeRadioGroup = ({ value, onChange, themes }: ThemeRadioGroupProps) => {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2" role="radiogroup">
      {themes.map((themeName) => {
        const isSelected = value === themeName;
        return (
          <button
            key={themeName}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={toLabel(themeName)}
            className={cn(
              'flex flex-col gap-3 rounded-xl border p-3 text-left transition cursor-pointer',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
              isSelected
                ? 'border-base-300 bg-primary/50 text-primary-content'
                : 'border-base-300/50 bg-primary/10 hover:border-base-300 hover:bg-primary/50',
            )}
            onClick={() => onChange?.(themeName)}
          >
            <div data-theme={themeName} className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2 text-sm font-semibold">
                <span className="truncate capitalize">{toLabel(themeName)}</span>
                <span className="rounded-full bg-primary px-2 py-[2px] text-[10px] font-semibold uppercase leading-none text-primary-content">
                  Aa
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex flex-1 items-center justify-between rounded-md bg-base-200/80 px-2 py-1 text-[11px] font-medium text-base-content/80">
                  <span className="truncate capitalize">{themeName}</span>
                  <span className="h-2 w-8 rounded-full bg-primary/80" />
                </div>
                <div className="flex items-center gap-1">
                  {PREVIEW_COLORS.map((color) => (
                    <span
                      key={color}
                      className={cn(
                        'h-5 w-5 rounded-full border border-black/10 shadow-sm shadow-black/20',
                        color === 'primary' && 'bg-primary text-primary-content',
                        color === 'secondary' && 'bg-secondary text-secondary-content',
                        color === 'accent' && 'bg-accent text-accent-content',
                        color === 'neutral' && 'bg-neutral text-neutral-content',
                      )}
                      aria-hidden
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <span className="h-10 flex-1 rounded-lg bg-base-300/80" aria-hidden />
                <span className="h-10 w-16 rounded-lg bg-primary/80" aria-hidden />
                <span className="h-10 w-16 rounded-lg bg-secondary/80" aria-hidden />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ThemeRadioGroup;
