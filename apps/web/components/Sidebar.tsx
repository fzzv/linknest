import { cn } from "@linknest/utils/lib";
import Image from "next/image";
import SvgIcon, { IconName } from "@/components/SvgIcon";

interface SidebarProps {
  className?: string;
  sidebarItems: {
    label: string;
    icon?: IconName;
    href?: string;
  }[];
}

const Sidebar = ({ className, sidebarItems }: SidebarProps) => {
  return (
    <div className={cn("w-64 h-screen", className)}>
      <header className="flex items-center gap-2 h-18 px-4 border-b border-gray-200">
        <Image src="/globe.svg" alt="logo" width={50} height={50} />
        <div className="text-2xl font-bold">Linknest</div>
      </header>

      <div className="flex-1 overflow-y-auto flex-col px-4 py-4 space-y-2">
        {sidebarItems.map((item) => (
          <div
            className="flex items-center gap-2 h-10 w-full px-4 rounded-md border border-gray-200 hover:bg-gray-100 cursor-pointer"
            key={item.label}
          >
            {item.icon && <SvgIcon name={item.icon} />}
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
