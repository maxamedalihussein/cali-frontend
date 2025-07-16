import { NavLink } from "react-router-dom";
import { LayoutDashboard, Car, DollarSign, Printer, Settings, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  variant?: "desktop" | "mobile";
}

const Sidebar = ({ isCollapsed, onToggle, variant = "desktop" }: SidebarProps) => {
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: Car, label: "Cars", path: "/cars" },
    { icon: DollarSign, label: "Sales", path: "/sales" },
    { icon: Printer, label: "Reports", path: "/reports" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  // Restore original sidebar background and text
  const containerClass =
    variant === "desktop"
      ? `${isCollapsed ? "w-16" : "w-64"} min-w-[4rem] bg-white text-black transition-all duration-300 ease-in-out flex flex-col h-screen shadow-lg rounded-2xl flex-shrink-0 fixed top-0 left-0 z-50`
      : "w-64 min-w-[16rem] max-w-full h-full bg-white text-black flex flex-col items-start shadow-lg rounded-2xl fixed top-0 left-0 z-[60] transition-transform duration-300 ease-in-out transform translate-x-0 overflow-y-auto";

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="text-black hover:bg-gray-200 transition-colors duration-200 rounded-lg shadow"
          >
            {isCollapsed ? <Menu size={16} /> : <X size={16} />}
          </Button>
        </div>
      </div>
      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto min-w-0">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path} className="relative">
              <NavLink
                to={item.path}
                onClick={variant === "mobile" ? onToggle : undefined}
                className={({ isActive }) =>
                  `flex flex-row items-center justify-start p-3 rounded-lg shadow transition-all duration-200 font-medium gap-2 relative ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 via-purple-600 to-red-500 text-white"
                      : "text-blue-800 hover:bg-gray-100 hover:text-blue-700"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon size={28} className="min-w-[28px] mr-2 ml-0" />
                    {!isCollapsed && <span className="text-xs text-gray-700 whitespace-nowrap ml-1">{item.label}</span>}
                    {isActive && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-8 border-b-8 border-l-8 border-t-transparent border-b-transparent border-l-white pointer-events-none"></span>
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;