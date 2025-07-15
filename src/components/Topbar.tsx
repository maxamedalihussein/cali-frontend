import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, User, Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface TopbarProps {
  onSidebarToggle?: () => void;
}

const Topbar = ({ onSidebarToggle }: TopbarProps) => {
  const { user, logout } = useAuth();
  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-2 sm:px-4 shadow-sm sticky top-0 z-40 w-full">
      {/* Left side - sidebar toggle, logo, and company name */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Sidebar toggle for mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden mr-2 rounded-lg shadow hover:bg-gray-100 hover:text-blue-700"
          onClick={onSidebarToggle}
        >
          <Menu className="h-6 w-6" />
        </Button>
        <img src="/publiccali-dayax-logo.png.jpg" alt="CALI DAYAX Logo" className="w-10 h-10 rounded-full bg-white object-contain border" />
        <h2 className="text-lg font-semibold text-black">CALI DAYAX</h2>
      </div>

      {/* Right side - Admin avatar and logout */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={logout}
          className="text-red-600 hover:bg-red-100"
        >
          <LogOut className="h-5 w-5 mr-1" />
          <span className="hidden md:inline">Logout</span>
        </Button>
      </div>
    </div>
  );
};

export default Topbar; 