'use client';

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import LinkCard, { LinkCardData } from "@/components/LinkCard";
import Link from "next/link";
import { Menu, Plus, Search } from "lucide-react";
import { cn } from "@linknest/utils/lib";
import { IconName } from "@/components/SvgIcon";
import { fetchCategories } from "@/services/categories";
import { Avatar, Button, useMessage } from "@linknest/ui";
import { useAuthStore } from "@/store/auth-store";

type SidebarItem = {
  label: string;
  icon?: IconName;
  count?: number;
  id: number;
};

const linkCards: LinkCardData[] = [
  {
    title: "DaisyUI Docs",
    description: "The most popular component library for Tailwind CSS.",
    icon: "/window.svg",
    iconBg: "from-[#fde7d4] via-[#f9d3cc] to-[#f2c9d5]",
  },
  {
    title: "Figma Community",
    description: "Explore thousands of community-made templates and UI kits.",
    icon: "/cover.svg",
    iconBg: "from-[#f6f1ff] via-[#f6f1ff] to-[#e9e4fb]",
  },
  {
    title: "React Official Website",
    description: "The library for building modern web and native interfaces.",
    icon: "/window.svg",
    iconBg: "from-[#eefeea] via-[#d9f6e4] to-[#dbeed7]",
  },
  {
    title: "MDN Web Docs",
    description: "Resources for developers, by developers on web standards.",
    icon: "/window.svg",
    iconBg: "from-[#d7eafd] via-[#d9f4ff] to-[#cfe0ff]",
  },
  {
    title: "Dribbble Inspiration",
    description: "The go-to community to discover work from creative people.",
    icon: "/cover.svg",
    iconBg: "from-[#f0f2ff] via-[#e7ecff] to-[#dae2ff]",
  },
  {
    title: "GitHub",
    description: "Where the world builds software and collaborates together.",
    icon: "/window.svg",
    iconBg: "from-[#f7f7f9] via-[#d7dae2] to-[#cacfd9]",
  },
  {
    title: "Tailwind CSS",
    description: "A utility-first CSS framework for rapid UI development.",
    icon: "/window.svg",
    iconBg: "from-[#d9f7f9] via-[#bff1f3] to-[#9be2ea]",
  },
  {
    title: "Unsplash",
    description: "Photos for everyone. Discover and download free images.",
    icon: "/cover.svg",
    iconBg: "from-[#d7e9ff] via-[#c8ddff] to-[#b8d2ff]",
  },
];

export default function Home() {
  const [message, messageHolder] = useMessage({ placement: 'top' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);
  const [sidebarItems, setSidebarItems] = useState<SidebarItem[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<number | undefined>(undefined);
  const { user, isAuthenticated, logout } = useAuthStore();

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
        const categories = await fetchCategories();
        if (!mounted) return;

        const mapped = categories.map((category) => ({
          id: category.id,
          label: category.name,
          icon: (category.icon as IconName) || "Bookmark",
          count: category.count ?? 0,
        }));

        setSidebarItems(mapped);
        if (mapped.length) {
          setActiveCategoryId(mapped[0]?.id);
        }
      } catch (error) {
        message.error("Failed to load categories");
        console.error("Failed to load categories", error);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

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
    message.success("已退出登录");
  };

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
            <Button
              variant="custom"
              color="custom"
              className="shrink-0"
            >
              <Plus className="h-5 w-5" />
              Bookmark
            </Button>
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
                  退出
                </Button>
              </div>
            ) : (
              <Link
                href="/login"
                className="rounded-2xl border border-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                登录
              </Link>
            )}
          </div>
        </nav>

        <main className="flex-1 px-4 py-10 sm:px-8 lg:px-14">
          <div className="max-w-6xl">
            <p className="text-xs uppercase tracking-[0.35em] text-white/40">Dashboard</p>
            <div className="mt-3 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">All Bookmarks</h1>
                <p className="mt-3 text-base text-white/70">
                  Showing all your saved links. {linkCards.length} items found.
                </p>
              </div>
              <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                <label className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white/80 focus-within:border-white/30 md:w-72">
                  <Search className="h-4 w-4 text-white/50" />
                  <input
                    type="text"
                    placeholder="Search bookmarks..."
                    className="w-full bg-transparent placeholder:text-white/40 focus:outline-none"
                  />
                </label>
                <Button
                  variant="outline"
                  className="border-0 text-sm font-semibold"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Bookmark
                </Button>
              </div>
            </div>
          </div>

          <section className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {linkCards.map((link) => (
              <LinkCard key={link.title} link={link} />
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}
