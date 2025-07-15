import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Car, DollarSign, Printer, Settings, Users } from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, path: "/", label: "Dashboard" },
  { icon: Car, path: "/cars", label: "Cars" },
  { icon: DollarSign, path: "/sales", label: "Sales" },
  { icon: Printer, path: "/reports", label: "Reports" },
  { icon: Settings, path: "/settings", label: "Settings" },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center bg-white border-t border-gray-200 shadow-md md:hidden h-16">
      {navItems.map(({ icon: Icon, path, label }) => {
        const active = location.pathname === path;
        return (
          <button
            key={path}
            aria-label={label}
            onClick={() => navigate(path)}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-colors duration-200
              ${active ? "text-primary" : "text-gray-700 hover:text-primary"}`}
          >
            <Icon size={28} />
            {/* No text label for minimal look */}
            <span className="sr-only">{label}</span>
          </button>
        );
      })}
    </nav>
  );
} 