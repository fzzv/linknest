import { cn } from "@linknest/utils/lib";
import { Button } from "@linknest/ui";
import SvgIcon, { IconName } from "@/components/SvgIcon";
import { useAuthStore } from "@/store/auth-store";
import { useTranslations } from "next-intl";

interface SidebarItem {
  label: string;
  icon?: IconName;
  href?: string;
  count?: number | string;
  id?: number;
}

interface SidebarProps {
  className?: string;
  sidebarItems: SidebarItem[];
  activeId?: number;
  onSelect?: (id: number | undefined, item: SidebarItem) => void;
  onCreateCategory?: () => void;
}

const Sidebar = ({ className, sidebarItems, activeId, onSelect, onCreateCategory }: SidebarProps) => {
  const { isAuthenticated } = useAuthStore();
  const t = useTranslations('Sidebar');

  return (
    <aside className={cn("flex h-screen w-64 flex-col border-r border-white/5 bg-[#050b16] text-white/80", className)}>
      <header className="px-6 py-5">
        <div className="flex items-center gap-4 rounded-3xl border border-white/5 bg-white/2 px-4 py-3">
          <div className="relative h-12 w-12 rounded-2xl bg-primary flex items-center justify-center">
            <span className="text-2xl font-bold">LN</span>
          </div>
          <div>
            <p className="text-lg font-semibold text-white">LinkNest</p>
            <p className="text-xs text-white/50">{t('yourBookmarkHub')}</p>
          </div>
        </div>
      </header>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
        {sidebarItems.map((item) => {
          const isActive = item.id === activeId;

          return (
            <Button
              key={item.id ?? item.label}
              variant="custom"
              className={cn(
                "h-auto w-full justify-start gap-3 rounded-2xl border border-transparent bg-transparent px-4 py-3 text-left text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
                isActive
                  ? "border-primary text-white"
                  : "text-white/70 hover:bg-white/5 hover:text-white",
              )}
              onClick={() => onSelect?.(item.id, item)}
              aria-pressed={isActive}
            >
              {item.icon && <SvgIcon name={item.icon} className="h-5 w-5" />}
              <span className="flex-1 text-left">{item.label}</span>
              {item.count !== undefined && (
                <span className="text-xs font-normal text-white/50">{item.count}</span>
              )}
            </Button>
          );
        })}
      </nav>

      <div className="px-4 py-4">
        {isAuthenticated && <Button
          variant="outline"
          color="primary"
          className="w-full rounded-2xl py-3 text-sm font-semibold transition"
          onClick={onCreateCategory}
        >
          {t('newCategory')}
        </Button>}
      </div>
    </aside>
  );
};

export default Sidebar;
