'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function Footer() {
  const t = useTranslations('Footer');

  return (
    <footer className="footer footer-center p-10 bg-base-200 text-base-content">
      <nav className="grid grid-flow-col gap-4">
        <Link href="/about" className="link link-hover">
          {t('about')}
        </Link>
        <Link href="/privacy" className="link link-hover">
          {t('privacy')}
        </Link>
        <Link href="/terms" className="link link-hover">
          {t('terms')}
        </Link>
      </nav>
      <aside>
        <p>{t('copyright')}</p>
      </aside>
    </footer>
  );
}
