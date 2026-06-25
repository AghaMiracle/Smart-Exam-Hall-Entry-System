import React, { useState, useEffect } from 'react';
import { ShieldCheck, Calendar, Menu } from 'lucide-react';

export const Header = ({ onToggleSidebar }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <header className="bg-white border-b-4 border-black px-4 md:px-8 py-4 flex items-center justify-between gap-4 shrink-0">
      {/* Menu Hamburger Toggle & Greeting */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onToggleSidebar}
          className="md:hidden flat-border-sm p-2 bg-white text-black hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5 stroke-[2.5]" />
        </button>
        <div className="flex items-center gap-1.5 text-black font-extrabold text-[10px] md:text-sm uppercase">
          <Calendar className="w-4 h-4 md:w-5 h-5 text-flatBlue shrink-0" />
          <span>{formatDate(time)}</span>
          <span className="text-gray-400">|</span>
          <span className="text-flatBlue">{formatTime(time)}</span>
        </div>
      </div>

      {/* System Status Indicators */}
      <div className="flex items-center gap-4">
        <div className="flat-border-sm bg-flatEmerald text-white px-3 md:px-4 py-1.5 md:py-2 font-black text-[9px] md:text-xs uppercase flex items-center gap-1.5 select-none shrink-0">
          <ShieldCheck className="w-4 h-4" />
          <span className="hidden sm:inline">VERIFICATION SERVICE ACTIVE</span>
          <span className="sm:hidden">ACTIVE</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
