'use client';

import { cn } from '@linknest/utils';
import { LogIn, LayoutDashboard, LogOut, Palette } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useAuthStore } from '@/store/auth-store';
import ThemeSelectorModal from '@/components/ThemeSelectorModal';

interface DiscoverNavbarProps {
  className?: string;
}

export default function DiscoverNavbar({ className }: DiscoverNavbarProps) {
  const t = useTranslations('Discover');
  const tCommon = useTranslations('Common');
  const { isAuthenticated, user, logout } = useAuthStore();
  const [themeModalOpen, setThemeModalOpen] = useState(false);

  return (
    <>
      <nav
        className={cn(
          'navbar bg-base-100 border-b border-base-300 px-4 sticky top-0 z-50',
          className,
        )}
      >
      {/* Logo */}
      <div className="flex-none">
        <Link href="/" className="btn btn-ghost text-xl font-bold">
          LinkNest
        </Link>
      </div>

      <div className="flex-1" />

      {/* Right Actions */}
      <div className="flex-none flex items-center gap-2">
        {/* Theme Button */}
        <button
          className="btn btn-ghost btn-sm btn-circle"
          onClick={() => setThemeModalOpen(true)}
          aria-label={tCommon('theme')}
        >
          <Palette className="w-4 h-4" />
        </button>

        {/* Auth Actions */}
        {isAuthenticated ? (
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar"
            >
              <div className="w-8 rounded-full bg-primary/20 flex items-center justify-center">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.nickname || 'User'} />
                ) : (
                  <span className="text-primary font-semibold">
                    {(user?.nickname || user?.email || 'U').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-200 rounded-box z-1 w-52 p-2 shadow-lg"
            >
              <li>
                <Link href="/dashboard">
                  <LayoutDashboard className="w-4 h-4" />
                  {t('goToDashboard')}
                </Link>
              </li>
              <li>
                <button onClick={logout}>
                  <LogOut className="w-4 h-4" />
                  {tCommon('logout')}
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <Link href="/login" className="btn btn-primary btn-sm">
            <LogIn className="w-4 h-4" />
            {tCommon('login')}
          </Link>
        )}
      </div>
      </nav>

      <ThemeSelectorModal
        open={themeModalOpen}
        onClose={() => setThemeModalOpen(false)}
      />
    </>
  );
}
