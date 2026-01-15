'use client';

import { cn } from '@linknest/utils';
import { useTranslations } from 'next-intl';

type FilterValue = 'latest' | 'popular' | 'recommended';

interface FilterTabsProps {
  value: FilterValue;
  onChange: (value: FilterValue) => void;
  className?: string;
}

export default function FilterTabs({ value, onChange, className }: FilterTabsProps) {
  const t = useTranslations('Discover');

  const tabs: { value: FilterValue; label: string }[] = [
    { value: 'recommended', label: t('filterRecommended') },
    { value: 'popular', label: t('filterPopular') },
    { value: 'latest', label: t('filterLatest') },
  ];

  return (
    <div className={cn('tabs tabs-boxed bg-base-200 inline-flex', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'tab',
            value === tab.value && 'tab-active',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
