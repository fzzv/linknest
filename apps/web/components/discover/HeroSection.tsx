'use client';

import { Search } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface HeroSectionProps {
  onSearch: (query: string) => void;
}

export default function HeroSection({ onSearch }: HeroSectionProps) {
  const t = useTranslations('Discover');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
    }
  };

  return (
    <section className="bg-linear-to-br from-primary/10 via-base-100 to-secondary/10 py-16 px-4">
      <div className="container mx-auto max-w-4xl text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          {t('heroTitle')}
        </h1>
        <p className="text-lg text-base-content/70 mb-8">
          {t('heroSubtitle')}
        </p>
        <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-base-content/50" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input input-bordered input-lg w-full pl-12 pr-24 bg-base-100 focus:input-primary"
            />
            <button
              type="submit"
              className="btn btn-primary absolute right-2 top-1/2 -translate-y-1/2"
            >
              {t('search')}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
