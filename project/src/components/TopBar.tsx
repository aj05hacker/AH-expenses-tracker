import React from 'react';
import { Menu } from 'lucide-react';

interface TopBarProps {
  onMenuClick: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-lg border-b border-white/40">
      <button
        className="p-2 rounded-full hover:bg-primary/10 transition-all"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu size={24} className="text-[#232946]" />
      </button>
      <h1 className="text-2xl font-bold text-[#232946] tracking-tight" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">AH</span>
        <span className="ml-1">Expenses</span>
      </h1>
      <div className="w-10" /> {/* Spacer for balance */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      `}</style>
    </div>
  );
};

export default TopBar; 