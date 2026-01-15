'use client';

import { cn } from '@linknest/utils';
import { Search, Menu, LogIn, LayoutDashboard, LogOut, Palette } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useTheme } from '@/hooks/useTheme';
import { DAISY_THEMES } from '@/hooks/theme-constants';

interface DiscoverNavbarProps {
  onSearch?: (query: string) => void;
  className?: string;
}

export default function DiscoverNavbar({ onSearch, className }: DiscoverNavbarProps) {
  const t = useTranslations('Discover');
  const tCommon = useTranslations('Common');
  const { isAuthenticated, user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim() && onSearch) {
      onSearch(searchTerm.trim());
    }
  };

  return (
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

      {/* Search (Desktop) */}
      <div className="flex-1 hidden md:flex justify-center px-4">
        <form onSubmit={handleSearch} className="w-full max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/50" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input input-bordered input-sm w-full pl-10"
            />
          </div>
        </form>
      </div>

      {/* Right Actions */}
      <div className="flex-none flex items-center gap-2">
        {/* Theme Dropdown */}
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-sm btn-circle">
            <Palette className="w-4 h-4" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-200 rounded-box z-1 w-40 p-2 shadow-lg max-h-60 overflow-y-auto"
          >
            {DAISY_THEMES.map((themeName) => (
              <li key={themeName}>
                <button
                  onClick={() => setTheme(themeName)}
                  className={cn(theme === themeName && 'active')}
                >
                  <span className="capitalize">{themeName}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

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

        {/* Mobile Menu */}
        <button
          className="btn btn-ghost btn-sm md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Search (Dropdown) */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-base-100 border-b border-base-300 p-4 md:hidden">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/50" />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input input-bordered w-full pl-10"
              />
            </div>
          </form>
        </div>
      )}
    </nav>
  );
}
