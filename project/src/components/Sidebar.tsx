import React, { useRef, useState } from 'react';
import { X, Settings, Download, Upload, Sun, Moon, Home, List, PieChart, DollarSign, User, FolderPlus } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const navLinks = [
  { to: '/', label: 'Dashboard', icon: <Home size={20} /> },
  { to: '/records', label: 'Records', icon: <List size={20} /> },
  { to: '/analysis', label: 'Analysis', icon: <PieChart size={20} /> },
  { to: '/budget', label: 'Budget', icon: <DollarSign size={20} /> },
  { to: '/accounts', label: 'Accounts', icon: <User size={20} /> },
  { to: '/categories', label: 'Categories', icon: <FolderPlus size={20} /> },
  { to: '/settings', label: 'Settings', icon: <Settings size={20} /> },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const { theme, toggleTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Backup logic (export)
  const handleBackup = async () => {
    try {
      const { db } = await import('../db/db');
      const categories = await db.categories.toArray();
      const transactions = await db.transactions.toArray();
      const data = { categories, transactions, exportDate: new Date().toISOString() };
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `expenses_tracker_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setToast({ type: 'success', msg: 'Backup downloaded!' });
    } catch (err) {
      setToast({ type: 'error', msg: 'Backup failed.' });
    }
    setTimeout(() => setToast(null), 3000);
  };

  // Restore logic (import)
  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };
  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data.categories || !data.transactions) throw new Error('Invalid backup file.');
      const { db } = await import('../db/db');
      await db.categories.clear();
      await db.transactions.clear();
      await db.categories.bulkAdd(data.categories);
      await db.transactions.bulkAdd(data.transactions);
      setToast({ type: 'success', msg: 'Data restored!' });
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      setToast({ type: 'error', msg: 'Restore failed.' });
    }
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className={`fixed inset-0 z-50 transition-all duration-300 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
        aria-label="Close sidebar overlay"
      />
      {/* Sidebar */}
      <aside
        className={`absolute left-0 top-0 h-full w-80 max-w-full bg-[var(--card-bg)]/95 backdrop-blur-2xl shadow-2xl border-r border-[var(--glass-border)]/40 rounded-r-3xl p-6 flex flex-col gap-6 transform transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Sidebar menu"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-[var(--background)]/70 hover:bg-error/80 text-error transition-colors" aria-label="Close sidebar"><X size={22} /></button>
        <nav className="flex flex-col gap-2 mt-8">
          {navLinks.map(link => (
            <a key={link.to} href={link.to} className="flex items-center gap-3 text-lg font-medium text-[var(--text-primary)] hover:text-primary transition-colors rounded-xl px-3 py-2 hover:bg-[var(--background)]/60">
              {link.icon} {link.label}
            </a>
          ))}
        </nav>
        <div className="flex-1" />
        {/* Backup/Restore */}
        <div className="flex flex-col gap-2 mt-4">
          <button onClick={handleBackup} className="flex items-center gap-3 text-lg font-medium text-[var(--text-primary)] hover:text-success transition-colors rounded-xl px-3 py-2 hover:bg-success/10">
            <Download size={20} /> Backup
          </button>
          <button onClick={handleRestoreClick} className="flex items-center gap-3 text-lg font-medium text-[var(--text-primary)] hover:text-accent transition-colors rounded-xl px-3 py-2 hover:bg-accent/10">
            <Upload size={20} /> Restore
          </button>
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleRestore} />
        </div>
        {/* Theme Toggle */}
        <div className="flex items-center gap-3 mt-6">
          <span className="text-[var(--text-secondary)] font-medium">Theme:</span>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-[var(--background)]/80 hover:bg-primary/10 transition-colors flex items-center justify-center"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <span className="text-[var(--text-primary)] font-semibold text-sm">{theme.charAt(0).toUpperCase() + theme.slice(1)}</span>
        </div>
        {/* Toast Feedback */}
        {toast && (
          <div className={`fixed left-24 bottom-8 z-[999] px-6 py-3 rounded-2xl shadow-xl font-semibold text-lg animate-fade-in ${toast.type === 'success' ? 'bg-success/90 text-white' : 'bg-error/90 text-white'}`}>{toast.msg}</div>
        )}
      </aside>
      <style>{`
        aside {
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.13);
        }
        .lux-glass-sidebar {
          background: rgba(255,255,255,0.18);
          box-shadow: 0 2px 12px 0 rgba(31, 38, 135, 0.10);
          backdrop-filter: blur(18px) saturate(1.3);
          border-radius: 18px;
          border: 1.5px solid var(--glass-border, rgba(255,255,255,0.22));
          transition: box-shadow 0.18s, transform 0.18s, background 0.18s;
        }
      `}</style>
    </div>
  );
};

export default Sidebar; 