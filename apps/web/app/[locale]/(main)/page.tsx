'use client';

import { type ChangeEvent, useCallback, useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import LinkCard, { LinkCardData } from "@/components/LinkCard";
import Link from "next/link";
import { Menu, PencilLine, Plus, Search, Trash2 } from "lucide-react";
import { cn } from "@linknest/utils/lib";
import { IconName } from "@/components/SvgIcon";
import { fetchCategories, fetchPublicCategories } from "@/services/categories";
import { deleteLink, fetchLinks, fetchPublicLinks, type LinkItem } from "@/services/links";
import { Avatar, Button, ContextMenu, Modal, Select, useMessage } from "@linknest/ui";
import { useAuthStore } from "@/store/auth-store";
import { useLocale, useTranslations, type Locale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import LinkFormModal from "@/components/LinkFormModal";

type SidebarItem = {
  label: string;
  icon?: IconName;
  count?: number;
  id: number;
};

export default function Home() {
  const [message, messageHolder] = useMessage({ placement: 'top' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);
  const [sidebarItems, setSidebarItems] = useState<SidebarItem[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<number | undefined>(undefined);
  const [links, setLinks] = useState<LinkCardData[]>([]);
  const [isLoadingLinks, setIsLoadingLinks] = useState(false);
  const [linkModal, setLinkModal] = useState<{ open: boolean; mode: 'create' | 'edit'; linkId?: number }>({
    open: false,
    mode: 'create',
    linkId: undefined,
  });
  const { user, isAuthenticated, logout } = useAuthStore();
  const t = useTranslations('Home');

  // 语言切换
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const languageOptions = [
    { value: 'en', label: t('languageEnglish') },
    { value: 'zh', label: t('languageChinese') },
  ];

  const handleLanguageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = event.target.value as Locale;
    if (nextLocale === locale) return;

    router.replace(pathname, { locale: nextLocale });
  };

  const loadLinks = useCallback(async (categoryId?: number, cancelToken?: { cancelled: boolean }) => {
    if (categoryId === undefined) {
      setLinks([]);
      setIsLoadingLinks(false);
      return;
    }

    setIsLoadingLinks(true);
    try {
      const data = isAuthenticated
        ? await fetchLinks(categoryId)
        : await fetchPublicLinks(categoryId);
      if (cancelToken?.cancelled) return;

      const mapped: LinkCardData[] = data.map((link: LinkItem) => ({
        id: link.id,
        title: link.title,
        description: link.description ?? '',
        url: link.url,
        icon: link.icon ?? link.cover ?? undefined,
      }));

      setLinks(mapped);
    } catch (error) {
      if (cancelToken?.cancelled) return;
      const errorMessage = error instanceof Error ? error.message : 'Failed to load links';
      message.error(errorMessage);
      setLinks([]);
    } finally {
      if (!cancelToken?.cancelled) {
        setIsLoadingLinks(false);
      }
    }
  }, [isAuthenticated, message]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const syncState = (matches: boolean) => {
      if (matches) {
        setIsSidebarOpen(false);
      }
    };
    const handleChange = (event: MediaQueryListEvent) => syncState(event.matches);

    syncState(mediaQuery.matches);
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (typeof mediaQuery.removeEventListener === "function") {
        mediaQuery.removeEventListener("change", handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const categories = isAuthenticated ? await fetchCategories() : await fetchPublicCategories();
        if (!mounted) return;

        const mapped = categories.map((category) => ({
          id: category.id,
          label: category.name,
          icon: (category.icon as IconName) || "Bookmark",
          count: category.count ?? 0,
        }));

        setSidebarItems(mapped);
        setActiveCategoryId(mapped.length ? mapped[0]?.id : undefined);
      } catch (error) {
        if (!mounted) return;
        message.error("Failed to load categories");
        console.error("Failed to load categories", error);
        setSidebarItems([]);
        setActiveCategoryId(undefined);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, message]);

  useEffect(() => {
    const cancelToken = { cancelled: false };
    void loadLinks(activeCategoryId, cancelToken);

    return () => {
      cancelToken.cancelled = true;
    };
  }, [activeCategoryId, loadLinks]);

  const toggleSidebar = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setIsDesktopSidebarCollapsed((prev) => !prev);
      return;
    }
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => setIsSidebarOpen(false);
  const handleSelectCategory = (id: number) => {
    setActiveCategoryId(id);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      closeSidebar();
    }
  };
  const handleLogout = () => {
    logout();
    message.success(t('logoutSuccess'));
  };
  const handleLinkCreated = () => {
    if (activeCategoryId !== undefined) {
      void loadLinks(activeCategoryId);
    }
  };
  const handleLinkUpdated = () => {
    if (activeCategoryId !== undefined) {
      void loadLinks(activeCategoryId);
    }
  };
  const handleEditLink = (id?: number) => {
    if (!id) return;
    setLinkModal({ open: true, mode: 'edit', linkId: id });
  };
  const handleDeleteLink = (id?: number) => {
    if (!id || !isAuthenticated) return;

    Modal.confirm({
      icon: <Trash2 className="h-5 w-5 text-error" />,
      title: t('delete'),
      content: (
        <p className="text-sm text-white/80">{t('deleteConfirm')}</p>
      ),
      okText: t('delete'),
      cancelText: t('cancel'),
      closable: true,
      onOk: async () => {
        try {
          await deleteLink(id);
          message.success(t('deleteSuccess'));
          if (activeCategoryId !== undefined) {
            await loadLinks(activeCategoryId);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : t('deleteFailed');
          message.error(errorMessage);
          return false;
        }
      },
    });
  };

  const openCreateLinkModal = () => setLinkModal({ open: true, mode: 'create', linkId: undefined });
  const closeLinkModal = () => setLinkModal((prev) => ({ ...prev, open: false, linkId: undefined, mode: 'create' }));

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      {messageHolder}
      <Sidebar
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 shadow-2xl transition-transform duration-300",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:shadow-none",
          isDesktopSidebarCollapsed ? "lg:-translate-x-full" : "lg:translate-x-0",
        )}
        sidebarItems={sidebarItems}
        activeId={activeCategoryId ?? undefined}
        onSelect={handleSelectCategory}
      />
      {/* 蒙层 点击蒙层关闭侧边栏 */}
      {isSidebarOpen && (
        <div
          aria-hidden
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[1px] lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding] duration-300",
          isDesktopSidebarCollapsed ? "lg:pl-0" : "lg:pl-64",
        )}
      >
        <nav className="flex h-16 items-center gap-3 border-b border-white/5 bg-[#050b16] px-4 text-sm font-semibold lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-2xl border border-white/10 text-white/80"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
            aria-expanded={isSidebarOpen}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span>LinkNest</span>
          <div className="ml-auto flex items-center gap-3">
            <Select
              size="sm"
              value={locale}
              variant="solid"
              onChange={handleLanguageChange}
              options={languageOptions}
              aria-label={t('language')}
              wrapperClassName="w-auto"
              className="min-w-30 pl-5"
            />

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Avatar
                  src={user?.avatar ?? undefined}
                  alt={user?.nickname ?? user?.email ?? "User"}
                  size="sm"
                />
                <Button
                  variant="ghost"
                  color="custom"
                  size="sm"
                  className="border border-white/10"
                  onClick={handleLogout}
                >
                  {t('logout')}
                </Button>
              </div>
            ) : (
              <Link
                href="/login"
                className="rounded-2xl border border-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                {t('login')}
              </Link>
            )}
          </div>
        </nav>

        <main className="flex-1 px-4 py-10 sm:px-8 lg:px-14">
          <div className="w-full">
            <p className="text-xs uppercase tracking-[0.35em] text-white/40">{t('dashboard')}</p>
            <div className="mt-3 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">{activeCategoryId ? sidebarItems.find(item => item.id === activeCategoryId)?.label : t('allBookmarks')}</h1>
                <p className="mt-3 text-base text-white/70">
                  {t('showAllYourSavedLinks', { count: links.length })}
                </p>
              </div>
              <div className="w-full flex gap-3 md:w-auto md:flex-row md:items-center">
                <label className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white/80 focus-within:border-white/30 md:w-72">
                  <Search className="h-4 w-4 text-white/50" />
                  <input
                    type="text"
                    placeholder={t('searchBookmarks')}
                    className="w-full bg-transparent placeholder:text-white/40 focus:outline-none"
                  />
                </label>
                {isAuthenticated && (
                  <Button
                    variant="custom"
                    color="custom"
                    className="shrink-0"
                    onClick={openCreateLinkModal}
                  >
                    <Plus className="h-4 w-4" />
                    {t('addLink')}
                  </Button>
                )}
              </div>
            </div>
          </div>

          <section className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {isLoadingLinks
              ? Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[110px] rounded-2xl border border-white/5 bg-white/3"
                >
                  <div className="h-full w-full animate-pulse rounded-2xl bg-white/5" />
                </div>
              ))
              : links.length > 0
                ? links.map((link) =>
                  (!isAuthenticated || !link.id) ? (
                    <LinkCard key={link.id ?? link.title} link={link} />
                  ) : (
                    <ContextMenu
                      key={link.id}
                      items={[
                        {
                          key: 'edit',
                          label: t('edit'),
                          icon: <PencilLine className="h-4 w-4" />,
                          onSelect: () => handleEditLink(link.id),
                        },
                        {
                          key: 'delete',
                          label: t('delete'),
                          icon: <Trash2 className="h-4 w-4" />,
                          danger: true,
                          onSelect: () => handleDeleteLink(link.id),
                        },
                      ]}
                      className="flex"
                    >
                      <LinkCard link={link} />
                    </ContextMenu>
                  ))
                : (
                  <p className="text-sm text-white/60 md:col-span-2 xl:col-span-3">
                    {t('noLinksFoundInThisCategory')}
                  </p>
                )}
          </section>
        </main>
      </div>

      <LinkFormModal
        open={linkModal.open}
        mode={linkModal.mode}
        linkId={linkModal.linkId}
        onClose={closeLinkModal}
        activeCategoryId={activeCategoryId}
        onCreated={handleLinkCreated}
        onUpdated={handleLinkUpdated}
        messageApi={message}
      />
    </div>
  );
}
