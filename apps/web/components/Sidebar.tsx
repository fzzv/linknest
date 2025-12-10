import { cn } from "@linknest/utils";
import { Button, ContextMenu, SvgIcon, type IconName } from "@linknest/ui";
import { useAuthStore } from "@/store/auth-store";
import { useTranslations } from "next-intl";
import { PencilLine, Trash2 } from "lucide-react";

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
  onEditCategory?: (id: number) => void;
  onDeleteCategory?: (id: number) => void;
}

const Sidebar = ({
  className,
  sidebarItems,
  activeId,
  onSelect,
  onCreateCategory,
  onEditCategory,
  onDeleteCategory,
}: SidebarProps) => {
  const { isAuthenticated } = useAuthStore();
  const t = useTranslations('Sidebar');

  return (
    <aside className={cn("flex h-screen w-64 flex-col border-r border-base-300 bg-base-100 text-primary", className)}>
      <header className="px-6 py-5">
        <div className="flex items-center gap-4 rounded-xl border border-primary bg-base-100 px-4 py-3 shadow-xl">
          <div className="relative h-12 w-12 rounded-md bg-primary flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-content">LN</span>
          </div>
          <div>
            <p className="text-lg font-semibold text-base-content">LinkNest</p>
            <p className="text-xs text-base-content/80">{t('yourBookmarkHub')}</p>
          </div>
        </div>
      </header>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
        {sidebarItems.map((item) => {
          const isActive = item.id === activeId;
          // 未登录的用户和公共分类不能使用右键菜单
          const canUseContextMenu = isAuthenticated && item.id !== undefined;

          const menuItems = canUseContextMenu
            ? [
              {
                key: 'edit',
                label: t('edit'),
                icon: <PencilLine className="h-4 w-4" />,
                onSelect: () => onEditCategory?.(item.id!),
              },
              {
                key: 'delete',
                label: t('delete'),
                icon: <Trash2 className="h-4 w-4" />,
                danger: true,
                onSelect: () => onDeleteCategory?.(item.id!),
              },
            ]
            : undefined;

          const button = (
            <button
              key={item.id ?? item.label}
              className={cn(
                "group flex items-center h-auto w-full justify-start gap-3 rounded-md px-4 py-3 text-left text-sm font-medium shadow-2xl",
                "transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral cursor-pointer",
                "text-base-content/70 border border-base-300 hover:text-base-content hover:bg-base-200",
                isActive && "bg-primary/90 text-primary-content border-primary-content hover:bg-primary/90 hover:text-primary-content"
              )}
              onClick={() => onSelect?.(item.id, item)}
              aria-pressed={isActive}
            >
              {item.icon && <SvgIcon name={item.icon} className="h-5 w-5" />}
              <span className="flex-1 text-left">{item.label}</span>
              {item.count !== undefined && (
                <span className="text-xs font-normal">{item.count}</span>
              )}
            </button>
          );

          if (canUseContextMenu && menuItems) {
            return (
              <ContextMenu key={item.id ?? item.label} items={menuItems} className="flex">
                {button}
              </ContextMenu>
            );
          }

          return button;
        })}
      </nav>

      <div className="px-4 py-4">
        {isAuthenticated && <Button
          variant="outline"
          color="primary"
          className="w-full rounded-md py-3 text-sm font-semibold transition"
          onClick={onCreateCategory}
        >
          {t('newCategory')}
        </Button>}
      </div>
    </aside>
  );
};

export default Sidebar;
