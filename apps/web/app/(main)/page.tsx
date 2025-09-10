import Sidebar from "@/components/Sidebar";
import { Menu } from "lucide-react";

const sidebarItems = [
  {
    label: "工具",
    icon: 'ChartLine',
  },
  {
    label: "链接",
    icon: 'Link',
  },
];

export default function Home() {
  return (
    <div>
      <Sidebar
        className="fixed top-0 left-0 lg:block hidden border-r border-gray-200"
        sidebarItems={sidebarItems}
      />
      <main className="lg:pl-[256px] w-full h-screen">
        <nav className="h-10 bg-green-300 flex items-center px-4 lg:hidden">
          <Menu className="text-white" />
        </nav>
      </main>
    </div>
  );
}
