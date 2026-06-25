import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white select-none relative">
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden cursor-pointer"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <Sidebar mobileOpen={sidebarOpen} setMobileOpen={setSidebarOpen} />

      {/* Right-Side Dashboard Frame */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative bg-geo-dots">
          {/* Decorative shapes to meet flat geometric requirements */}
          <div className="geo-shape-circle w-80 h-80 -top-20 -right-20 opacity-20" />
          <div className="geo-shape-circle w-40 h-40 top-1/2 left-1/3 opacity-10 bg-flatAmber" />
          <div className="geo-shape-triangle -bottom-10 -left-10 opacity-20 rotate-45" />

          {/* Child Routes Output */}
          <div className="relative z-10 max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
