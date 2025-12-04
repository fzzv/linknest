'use client';

import { cn } from '@linknest/utils';
import SvgIcon, { IconName } from './SvgIcon';

const COMMON_ICON_NAMES: IconName[] = [
  'Bookmark',
  'BookOpen',
  'Star',
  'Home',
  'Tag',
  'Link',
  'Folder',
  'Globe',
  'Heart',
  'Sparkles',
  'Flame',
  'MessageSquare',
  'Code',
  'Cloud',
  'Camera',
  'Gamepad2',
  'Palette',
  'Music',
  'ShoppingBag',
  'Briefcase',
  'Calendar',
  'Lightbulb',
  'Monitor',
  'Rocket',
];

type IconRadioGroupProps = {
  value?: IconName;
  onChange?: (value: IconName) => void;
};

const IconRadioGroup = ({ value, onChange }: IconRadioGroupProps) => {
  return (
    <div className="grid grid-cols-4 gap-3 md:grid-cols-5" role="radiogroup">
      {COMMON_ICON_NAMES.map((iconName) => {
        const isSelected = value === iconName;
        return (
          <button
            key={iconName}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={iconName}
            title={iconName}
            className={cn(
              'flex h-16 flex-col items-center justify-center gap-2 rounded-xl border text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
              isSelected
                ? 'border-primary/80 bg-primary/10 text-white'
                : 'border-white/10 text-white/70 hover:border-white/30 hover:bg-white/5',
            )}
            onClick={() => onChange?.(iconName)}
          >
            <SvgIcon name={iconName} className="h-5 w-5" />
            <span className="truncate px-2">{iconName}</span>
          </button>
        );
      })}
    </div>
  );
};

export { COMMON_ICON_NAMES };
export default IconRadioGroup;
