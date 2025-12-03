'use client';

import { type ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
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
  id?: number;
};

export default function Home() {
  const [message, messageHolder] = useMessage({ placement: 'top' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);
  const [sidebarItems, setSidebarItems] = useState<SidebarItem[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<number | undefined>(undefined);
  const [links, setLinks] = useState<LinkCardData[]>([]);
  const [isLoadingLinks, setIsLoadingLinks] = useState(false);
  const [linkModal, setLinkModal] = useState<{ open: boolean; linkId?: number }>({
    open: false,
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

  // 加载link列表
  const loadLinks = useCallback(async (categoryId?: number, cancelToken?: { cancelled: boolean }) => {
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

  // 加载分类列表
  const loadCategories = useCallback(
    async (
      options?: {
        preserveActive?: boolean;
        cancelToken?: { cancelled: boolean };
      },
    ) => {
      const { preserveActive = false, cancelToken } = options ?? {};
      try {
        const categories = isAuthenticated ? await fetchCategories() : await fetchPublicCategories();
        if (cancelToken?.cancelled) return;

        const mapped = categories.map((category) => ({
          id: category.id,
          label: category.name,
          icon: (category.icon as IconName) || "Bookmark",
          count: category.count ?? 0,
        }));

        // 计算所有分类的链接总数
        const totalCount = mapped.reduce((sum, category) => sum + (category.count ?? 0), 0);

        const sidebarData: SidebarItem[] = [
          // 默认分类
          {
            id: undefined,
            label: t('allBookmarks'),
            icon: 'SquareStar',
            count: totalCount,
          },
          // 其他分类
          ...mapped,
        ];

        setSidebarItems(sidebarData);
        setActiveCategoryId((prev) => {
          if (preserveActive) {
            const exists =
              prev === undefined || mapped.some((category) => category.id === prev);
            if (exists) return prev;
          }
          return sidebarData.length ? sidebarData[0]?.id : undefined;
        });
      } catch (error) {
        if (cancelToken?.cancelled) return;
        message.error("Failed to load categories");
        setSidebarItems([]);
        if (!preserveActive) {
          setActiveCategoryId(undefined);
        }
        console.error("Failed to load categories", error);
      }
    },
    [isAuthenticated, message, t],
  );

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
    const cancelToken = { cancelled: false };
    void loadCategories({ preserveActive: true, cancelToken });
    return () => {
      cancelToken.cancelled = true;
    };
  }, [loadCategories]);

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
  const handleSelectCategory = (id?: number) => {
    setActiveCategoryId(id);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      closeSidebar();
    }
  };
  const handleLogout = () => {
    logout();
    message.success(t('logoutSuccess'));
  };
  // 刷新链接列表和分类列表
  const refreshAfterLinkChange = useCallback(async () => {
    await loadLinks(activeCategoryId);
    await loadCategories({ preserveActive: true });
  }, [activeCategoryId, loadLinks, loadCategories]);
  // 获取当前分类名称
  const activeCategoryLabel = useMemo(() => {
    if (!activeCategoryId) return t('allBookmarks');
    return sidebarItems.find(i => i.id === activeCategoryId)?.label ?? t('allBookmarks');
  }, [activeCategoryId, sidebarItems, t]);

  const handleEditLink = (id?: number) => {
    if (!id) return;
    setLinkModal({ open: true, linkId: id });
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
          await refreshAfterLinkChange();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : t('deleteFailed');
          message.error(errorMessage);
          return false;
        }
      },
    });
  };

  // 右击菜单items
  const getLinkMenuItems = useCallback((id: number) => ([
    {
      key: 'edit',
      label: t('edit'),
      icon: <PencilLine className="h-4 w-4" />,
      onSelect: () => handleEditLink(id),
    },
    {
      key: 'delete',
      label: t('delete'),
      icon: <Trash2 className="h-4 w-4" />,
      danger: true,
      onSelect: () => handleDeleteLink(id),
    },
  ]), [t, handleDeleteLink, handleEditLink])

  const openCreateLinkModal = () => setLinkModal({ open: true, linkId: undefined });
  const closeLinkModal = () => setLinkModal((prev) => ({ ...prev, open: false, linkId: undefined }));

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
                <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">{activeCategoryLabel}</h1>
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
                      items={getLinkMenuItems(link.id)}
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
        mode={linkModal.linkId ? 'edit' : 'create'}
        linkId={linkModal.linkId}
        onClose={closeLinkModal}
        activeCategoryId={activeCategoryId}
        onCreated={refreshAfterLinkChange}
        onUpdated={refreshAfterLinkChange}
        messageApi={message}
      />
    </div>
  );
}
