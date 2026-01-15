'use client';

import { type ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useDebounce } from "use-debounce";
import Sidebar from "@/components/Sidebar";
import LinkCard, { LinkCardData, LinkCardSkeleton } from "@/components/LinkCard";
import Link from "next/link";
import { Download, LogOut, Menu, Palette, PencilLine, Plus, Search, Trash2, Upload as UploadIcon } from "lucide-react";
import { cn, download } from "@linknest/utils";
import { deleteCategory, fetchCategories, fetchPublicCategories } from "@/services/categories";
import { deleteLink, fetchLinks, fetchPublicLinks, searchLinks as searchPrivateLinks, searchPublicLinks, type LinkItem } from "@/services/links";
import { Avatar, Button, ContextMenu, Modal, Select, useMessage, type IconName } from "@linknest/ui";
import { useAuthStore } from "@/store/auth-store";
import { useLocale, useTranslations, type Locale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import LinkFormModal from "@/components/LinkFormModal";
import CategoryFormModal from "@/components/CategoryFormModal";
import { useVirtualizedMasonryGrid } from "@/hooks/useVirtualizedMasonryGrid";
import ImportBookmarksModal from "@/components/ImportBookmarksModal";
import { exportBookmarks } from "@/services/bookmarks";
import UserProfileModal from "@/components/UserProfileModal";
import ThemeSelectorModal from "@/components/ThemeSelectorModal";
import { useTheme } from "@/hooks/useTheme";

type SidebarItem = {
  label: string;
  icon?: IconName;
  count?: number;
  id?: number;
};

export default function DashboardPage() {
  const [message, messageHolder] = useMessage({ placement: 'top' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);
  const [sidebarItems, setSidebarItems] = useState<SidebarItem[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<number | undefined>(undefined);
  const [links, setLinks] = useState<LinkCardData[]>([]);
  const [isLoadingLinks, setIsLoadingLinks] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [categoryModal, setCategoryModal] = useState<{ open: boolean; categoryId?: number }>({
    open: false,
    categoryId: undefined,
  });
  const [linkModal, setLinkModal] = useState<{ open: boolean; linkId?: number }>({
    open: false,
    linkId: undefined,
  });
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const t = useTranslations('Home');
  const tSidebar = useTranslations('Sidebar');
  const tProfile = useTranslations('UserProfileModal');
  const { theme } = useTheme();

  // 语言切换
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const languageOptions = [
    { value: 'en', label: t('languageEnglish') },
    { value: 'zh', label: t('languageChinese') },
  ];
  const themeLabel = useMemo(() => theme.charAt(0).toUpperCase() + theme.slice(1), [theme]);

  const handleLanguageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = event.target.value as Locale;
    if (nextLocale === locale) return;

    router.replace(pathname, { locale: nextLocale });
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const toCardData = (data: LinkItem[]): LinkCardData[] =>
    data.map((link) => ({
      id: link.id,
      title: link.title,
      description: link.description ?? "",
      url: link.url,
      icon: link.icon ?? link.cover ?? undefined,
    }));

  // 加载link列表
  const loadLinks = useCallback(async (categoryId?: number, cancelToken?: { cancelled: boolean }) => {
    setIsLoadingLinks(true);
    try {
      const data = isAuthenticated
        ? await fetchLinks(categoryId)
        : await fetchPublicLinks(categoryId);
      if (cancelToken?.cancelled) return;

      setLinks(toCardData(data));
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

  // 搜索链接
  const searchLinksByKeyword = useCallback(
    async (keyword: string, cancelToken?: { cancelled: boolean }) => {
      const query = keyword.trim();
      if (!query) return;

      setIsLoadingLinks(true);
      try {
        const data = isAuthenticated
          ? await searchPrivateLinks(query)
          : await searchPublicLinks(query);
        if (cancelToken?.cancelled) return;

        setLinks(toCardData(data));
      } catch (error) {
        if (cancelToken?.cancelled) return;
        const errorMessage = error instanceof Error ? error.message : t('searchFailed');
        message.error(errorMessage);
        setLinks([]);
      } finally {
        if (!cancelToken?.cancelled) {
          setIsLoadingLinks(false);
        }
      }
    },
    [isAuthenticated, message, t],
  );

  const {
    containerRef: listContainerRef,
    gridTemplateColumnsStyle,
    shouldVirtualize,
    virtualRows,
    totalHeight,
  } = useVirtualizedMasonryGrid<LinkCardData>({
    items: links,
    isLoading: isLoadingLinks,
    estimateRowHeight: 96,
    rowGap: 24,
    overscan: 6,
  });

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

  const openCreateCategoryModal = () => setCategoryModal({ open: true, categoryId: undefined });
  const openEditCategoryModal = (id: number) => setCategoryModal({ open: true, categoryId: id });
  const closeCategoryModal = () => setCategoryModal({ open: false, categoryId: undefined });
  const handleCategoryCreated = useCallback(async (categoryId: number) => {
    setActiveCategoryId(categoryId);
    await loadCategories({ preserveActive: true });
  }, [loadCategories]);

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
    const keyword = debouncedSearchTerm.trim();
    if (keyword) {
      void searchLinksByKeyword(keyword, cancelToken);
    } else {
      void loadLinks(activeCategoryId, cancelToken);
    }
    return () => {
      cancelToken.cancelled = true;
    };
  }, [activeCategoryId, loadLinks, debouncedSearchTerm, searchLinksByKeyword]);

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
  const handleLogout = useCallback(() => {
    Modal.confirm({
      icon: <LogOut className="h-5 w-5 text-base-content" />,
      title: t('logoutConfirmTitle'),
      content: (
        <p className="text-sm text-base-content/90">{t('logoutConfirmContent')}</p>
      ),
      okText: t('logout'),
      cancelText: t('cancel'),
      closable: true,
      onOk: () => {
        logout();
        setProfileModalOpen(false);
        message.success(t('logoutSuccess'));
      },
    });
  }, [logout, message, t]);
  // 刷新链接列表和分类列表
  const refreshAfterLinkChange = useCallback(async () => {
    const keyword = debouncedSearchTerm.trim();
    if (keyword) {
      await searchLinksByKeyword(keyword);
    } else {
      await loadLinks(activeCategoryId);
    }
    await loadCategories({ preserveActive: true });
  }, [activeCategoryId, loadLinks, loadCategories, searchLinksByKeyword, debouncedSearchTerm]);
  const handleCategoryUpdated = useCallback(async () => {
    await refreshAfterLinkChange();
  }, [refreshAfterLinkChange]);

  const openImportModal = () => setImportModalOpen(true);
  const closeImportModal = () => setImportModalOpen(false);
  const openProfileModal = () => setProfileModalOpen(true);
  const closeProfileModal = () => setProfileModalOpen(false);
  const openThemeModal = () => setThemeModalOpen(true);
  const closeThemeModal = () => setThemeModalOpen(false);
  // 导出书签
  const handleExportBookmarks = useCallback(() => {
    if (!isAuthenticated) return;

    Modal.confirm({
      icon: <Download className="h-5 w-5 text-base-content" />,
      title: t('exportConfirmTitle'),
      content: (
        <p className="text-sm text-base-content/90">{t('exportConfirmContent')}</p>
      ),
      okText: t('exportBookmarks'),
      cancelText: t('cancel'),
      closable: true,
      onOk: async () => {
        try {
          const { blob, filename } = await exportBookmarks();
          await download(blob, filename);
          message.success(t('exportSuccess'));
        } catch (error) {
          const messageText =
            error instanceof Error && error.message === 'Export failed'
              ? t('exportFailed')
              : error instanceof Error
                ? error.message
                : t('exportFailed');
          message.error(messageText);
          return false;
        }
      },
    });
  }, [isAuthenticated, message, t]);
  // 导入后刷新列表数据
  const handleBookmarksImported = useCallback(async () => {
    await refreshAfterLinkChange();
  }, [refreshAfterLinkChange]);

  // 获取当前分类名称
  const sidebarLabelMap = useMemo(() => {
    const m = new Map<number | undefined, string>();
    for (const item of sidebarItems) m.set(item.id, item.label);
    return m;
  }, [sidebarItems]);
  const activeCategoryLabel = sidebarLabelMap.get(activeCategoryId) ?? t('allBookmarks');

  const handleEditLink = useCallback((id?: number) => {
    if (!id) return;
    setLinkModal({ open: true, linkId: id });
  }, [])
  const handleDeleteLink = useCallback((id?: number) => {
    if (!id || !isAuthenticated) return;

    Modal.confirm({
      icon: <Trash2 className="h-5 w-5 text-error" />,
      title: t('delete'),
      content: (
        <p className="text-sm text-base-content/90">{t('deleteConfirm')}</p>
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
  }, [])

  const handleDeleteCategory = (id?: number) => {
    if (!id || !isAuthenticated) return;

    Modal.confirm({
      icon: <Trash2 className="h-5 w-5 text-error" />,
      title: tSidebar('delete'),
      content: (
        <p className="text-sm text-base-content/90">{tSidebar('deleteConfirm')}</p>
      ),
      okText: tSidebar('delete'),
      cancelText: t('cancel'),
      closable: true,
      onOk: async () => {
        try {
          await deleteCategory(id);
          message.success(tSidebar('deleteSuccess'));
          await loadCategories({ preserveActive: true });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : tSidebar('deleteFailed');
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
  ]), [t, handleDeleteLink, handleEditLink]);

  const openCreateLinkModal = () => setLinkModal({ open: true, linkId: undefined });
  const closeLinkModal = () => setLinkModal((prev) => ({ ...prev, open: false, linkId: undefined }));

  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      {messageHolder}
      <Sidebar
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 shadow-2xl transition-transform duration-300",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:shadow-none",
          isDesktopSidebarCollapsed ? "lg:-translate-x-full" : "lg:translate-x-0",
        )}
        sidebarItems={sidebarItems}
        activeId={activeCategoryId}
        onSelect={handleSelectCategory}
        onCreateCategory={openCreateCategoryModal}
        onEditCategory={openEditCategoryModal}
        onDeleteCategory={handleDeleteCategory}
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
        <nav className="flex h-16 items-center gap-3 border-b border-base-300 bg-base-100 px-4 text-sm font-semibold">
          <Button
            variant="ghost"
            size="icon"
            color="primary"
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
              color="custom"
              onChange={handleLanguageChange}
              options={languageOptions}
              aria-label={t('language')}
              wrapperClassName="w-auto"
              className="min-w-30 pl-5"
            />
            <Button
              size="sm"
              color="primary"
              onClick={openThemeModal}
              aria-label={t('theme')}
            >
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">{t('theme')}</span>
              <span className="text-xs uppercase sm:text-[11px]">{themeLabel}</span>
            </Button>
            {isAuthenticated ? (
              <>
                <Button
                  color="primary"
                  size="sm"
                  onClick={openImportModal}
                >
                  <UploadIcon className="h-4 w-4" />
                  {t('importBookmarks')}
                </Button>
                <Button
                  color="primary"
                  size="sm"
                  onClick={handleExportBookmarks}
                >
                  <Download className="h-4 w-4" />
                  {t('exportBookmarks')}
                </Button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    title={t('updateUserInfo')}
                    onClick={openProfileModal}
                    className={cn(
                      "rounded-full border border-base-100 p-[2px] transition cursor-pointer",
                      "hover:border-base-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                    )}
                    aria-label={tProfile('title')}
                  >
                    <Avatar
                      src={user?.avatar ?? undefined}
                      alt={user?.nickname ?? user?.email ?? "User"}
                      size="sm"
                    />
                  </button>
                  <Button
                    color="primary"
                    size="sm"
                    onClick={handleLogout}
                  >
                    {t('logout')}
                  </Button>
                </div>
              </>
            ) : (
              <Button
                color="primary"
                size="sm"
              >
                <Link
                  href="/login"
                >
                  {t('login')}
                </Link>
              </Button>
            )}
          </div>
        </nav>

        <main className="px-4 py-5 sm:px-8 lg:px-14 flex flex-col gap-10 h-[calc(100vh-4rem)]">
          <div className="w-full shrink-0">
            <p className="text-xs uppercase tracking-[0.35em]">{t('dashboard')}</p>
            <div className="mt-3 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-4xl font-black tracking-tight sm:text-5xl">{activeCategoryLabel}</h1>
                <p className="mt-3">
                  {t('showAllYourSavedLinks', { count: links.length })}
                </p>
              </div>
              <div className="w-full flex gap-3 md:w-auto md:flex-row md:items-center">
                <label className="flex w-full items-center gap-3 rounded-2xl border border-base-100 bg-base-200 px-4 py-3 text-sm text-base-content focus-within:border-base-300 md:w-72">
                  <Search className="h-4 w-4 text-base-content" />
                  <input
                    type="text"
                    placeholder={t('searchBookmarks')}
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full bg-transparent placeholder-base-content/50 focus:outline-none"
                  />
                </label>
                {isAuthenticated && (
                  <Button
                    color="primary"
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

          {/* 链接列表 */}
          <section
            ref={listContainerRef}
            className="h-full overflow-y-auto"
          >
            {isLoadingLinks ? (
              <div className="grid gap-6" style={gridTemplateColumnsStyle}>
                {Array.from({ length: 12 }).map((_, index) => (
                  <LinkCardSkeleton key={index} />
                ))}
              </div>
            ) : links.length > 0 ? (
              shouldVirtualize ? (
                <div
                  style={{
                    height: totalHeight,
                    position: "relative",
                  }}
                >
                  {virtualRows.map((row) => (
                    <div
                      key={row.virtualItem.key}
                      ref={row.measureElement}
                      data-index={row.virtualItem.index}
                      className="absolute left-0 top-0 w-full"
                      style={row.style}
                    >
                      <div className="grid gap-6" style={gridTemplateColumnsStyle}>
                        {row.items.map((link) =>
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
                          ),
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid gap-6" style={gridTemplateColumnsStyle}>
                  {links.map((link) =>
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
                    ),
                  )}
                </div>
              )
            ) : (
              <div className="grid h-full gap-6" style={gridTemplateColumnsStyle}>
                <div className="flex flex-col items-center justify-center gap-3 md:col-span-2 xl:col-span-3">
                  <img src="/empty.svg" alt="Empty" className="h-60 w-60 opacity-80" />
                  <p className="text-sm text-primary">
                    {searchTerm.trim() ? t('noSearchResults') : t('noLinksFoundInThisCategory')}
                  </p>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>

      <CategoryFormModal
        open={categoryModal.open}
        mode={categoryModal.categoryId ? 'edit' : 'create'}
        categoryId={categoryModal.categoryId}
        onClose={closeCategoryModal}
        onCreated={handleCategoryCreated}
        onUpdated={handleCategoryUpdated}
        messageApi={message}
      />
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
      <ImportBookmarksModal
        open={importModalOpen}
        onClose={closeImportModal}
        onImported={handleBookmarksImported}
      />
      <ThemeSelectorModal
        open={themeModalOpen}
        onClose={closeThemeModal}
      />
      <UserProfileModal
        open={profileModalOpen}
        onClose={closeProfileModal}
      />
    </div>
  );
}
