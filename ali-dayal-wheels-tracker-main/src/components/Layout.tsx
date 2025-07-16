import { ReactNode, useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import BottomNav from "./BottomNav";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    // Remove all code that sets or checks for the 'dark' class on document.documentElement or window.matchMedia('(prefers-color-scheme: dark)').
  }, []);

  return (
    <div className="min-h-screen bg-white text-black flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar 
          isCollapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
          variant="desktop"
        />
      </div>
      {/* Mobile Sidebar Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/10 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          {/* Sidebar Drawer */}
          <div className="relative w-64 max-w-full h-full z-50 bg-white shadow-lg transition-transform duration-300 ease-in-out transform translate-x-0 animate-[slideInLeft_0.3s_ease]">
            <Sidebar isCollapsed={false} onToggle={() => setMobileSidebarOpen(false)} variant="mobile" />
            {/* Close button */}
            <button className="absolute top-4 right-4 text-xl" onClick={() => setMobileSidebarOpen(false)}>&times;</button>
          </div>
        </div>
      )}
      {/* Main content area */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'} w-full`}> 
        <Topbar onSidebarToggle={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 p-2 sm:p-4 lg:p-6 bg-gray-50 overflow-y-auto w-full max-w-full">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
};

export default Layout;