import React, { useState, useEffect } from 'react';
import { db } from '../db/db';
import { useTheme } from '../context/ThemeContext';
import { Download, Trash2, ArrowLeft, Moon, Sun, AlertTriangle, Globe } from 'lucide-react';

// Add currency list
const currencyList = [
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', flag: '🇨🇳' },
  { code: 'CAD', symbol: '$', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'AUD', symbol: '$', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', flag: '🇦🇪' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', flag: '🇸🇦' },
  // Add more as needed
];

const getStoredCurrency = () => {
  return JSON.parse(localStorage.getItem('ah_currency') || 'null') || currencyList[0];
};

const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Currency state (must be inside component)
  const [currency, setCurrency] = useState(getStoredCurrency());
  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = currencyList.find(c => c.code === e.target.value) || currencyList[0];
    setCurrency(selected);
    localStorage.setItem('ah_currency', JSON.stringify(selected));
  };

  // Import state (must be inside component)
  const [importStatus, setImportStatus] = useState<'idle'|'success'|'error'>('idle');
  const [importMsg, setImportMsg] = useState('');
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data.categories || !data.transactions) throw new Error('Invalid backup file.');
      await db.categories.clear();
      await db.transactions.clear();
      await db.categories.bulkAdd(data.categories);
      await db.transactions.bulkAdd(data.transactions);
      setImportStatus('success');
      setImportMsg('Data imported successfully!');
    } catch (err) {
      setImportStatus('error');
      setImportMsg('Failed to import. Please check your file.');
    }
    setTimeout(() => setImportStatus('idle'), 3500);
  };

  // Export all data as JSON
  const exportData = async () => {
    try {
      // Get all data from the database
      const categories = await db.categories.toArray();
      const transactions = await db.transactions.toArray();
      
      // Create a data object
      const data = {
        categories,
        transactions,
        exportDate: new Date().toISOString(),
      };
      
      // Convert to JSON
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = url;
      link.download = `expenses_tracker_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    }
  };
  
  // Clear all data
  const clearAllData = async () => {
    try {
      await db.transactions.clear();
      await db.categories.clear();
      
      // Reinitialize default categories
      await db.initializeDefaultCategories();
      
      setShowConfirmation(false);
      
      alert('All data has been cleared successfully.');
    } catch (error) {
      console.error('Error clearing data:', error);
      alert('Failed to clear data. Please try again.');
    }
  };
  
  return (
    <div className="max-w-lg mx-auto animate-fade-in pb-32">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="space-y-4">
        {/* App Info Luxury Branding */}
        <div className="card glassy-card mb-4">
          <h2 className="text-lg font-medium mb-3">AH Expenses Tracker</h2>
          <div className="space-y-2 text-text-secondary text-sm">
            <p className="font-bold text-primary text-lg">AH Expenses Tracker v1.0.0</p>
            <p className="italic">A luxury progressive web app for tracking your income and expenses, with glassy UI and daily-use features.</p>
            <p>All data is stored locally on your device.</p>
          </div>
        </div>
        {/* Navigation & Pages Luxury Section */}
        <div className="card glassy-card mb-4 animate-fade-in">
          <h2 className="text-lg font-medium mb-3">Navigation & Pages</h2>
          <div className="grid grid-cols-1 gap-3">
            {/* Records */}
            <a href="/records" className="flex items-center gap-4 p-4 rounded-xl hover:bg-[var(--background)]/60 transition-all group">
              <span className="bg-primary/10 text-primary rounded-2xl p-3 text-2xl shadow-lg group-hover:scale-110 transition-transform"><svg width="28" height="28" fill="none" viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="14" rx="3" stroke="currentColor" strokeWidth="2"/><path d="M8 9h8M8 13h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></span>
              <div>
                <div className="font-bold text-base text-[var(--text-primary)]">Records</div>
                <div className="text-sm text-[var(--text-secondary)]">View, add, and manage all your transactions in a luxury, sortable, filterable list.</div>
              </div>
            </a>
            {/* Analysis */}
            <a href="/analysis" className="flex items-center gap-4 p-4 rounded-xl hover:bg-[var(--background)]/60 transition-all group">
              <span className="bg-accent/10 text-accent rounded-2xl p-3 text-2xl shadow-lg group-hover:scale-110 transition-transform"><svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M21 20V10M12 20V4M3 20v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></span>
              <div>
                <div className="font-bold text-base text-[var(--text-primary)]">Analysis</div>
                <div className="text-sm text-[var(--text-secondary)]">Animated analytics dashboard with monthly summaries, category breakdowns, money flow, trends, and CSV export.</div>
              </div>
            </a>
            {/* Budget */}
            <a href="/budget" className="flex items-center gap-4 p-4 rounded-xl hover:bg-[var(--background)]/60 transition-all group">
              <span className="bg-success/10 text-success rounded-2xl p-3 text-2xl shadow-lg group-hover:scale-110 transition-transform"><svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 18 0A9 9 0 0 0 3 12Zm9-4v4l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
              <div>
                <div className="font-bold text-base text-[var(--text-primary)]">Budget</div>
                <div className="text-sm text-[var(--text-secondary)]">Set and track monthly budgets for categories, with progress bars and alerts.</div>
              </div>
            </a>
            {/* Accounts */}
            <a href="/accounts" className="flex items-center gap-4 p-4 rounded-xl hover:bg-[var(--background)]/60 transition-all group">
              <span className="bg-warning/10 text-warning rounded-2xl p-3 text-2xl shadow-lg group-hover:scale-110 transition-transform"><svg width="28" height="28" fill="none" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="3" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="14" r="3" stroke="currentColor" strokeWidth="2"/></svg></span>
              <div>
                <div className="font-bold text-base text-[var(--text-primary)]">Accounts</div>
                <div className="text-sm text-[var(--text-secondary)]">Manage your accounts (wallets, cards, banks) and view balances.</div>
              </div>
            </a>
            {/* Categories */}
            <a href="/categories" className="flex items-center gap-4 p-4 rounded-xl hover:bg-[var(--background)]/60 transition-all group">
              <span className="bg-error/10 text-error rounded-2xl p-3 text-2xl shadow-lg group-hover:scale-110 transition-transform"><svg width="28" height="28" fill="none" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="2"/><path d="M8 8h8v8H8z" stroke="currentColor" strokeWidth="2"/></svg></span>
              <div>
                <div className="font-bold text-base text-[var(--text-primary)]">Categories</div>
                <div className="text-sm text-[var(--text-secondary)]">Create, edit, and organize income/expense categories with icons and colors.</div>
              </div>
            </a>
            {/* Settings */}
            <a href="/settings" className="flex items-center gap-4 p-4 rounded-xl hover:bg-[var(--background)]/60 transition-all group">
              <span className="bg-[var(--card-bg)]/80 text-[var(--text-secondary)] rounded-2xl p-3 text-2xl shadow-lg group-hover:scale-110 transition-transform"><svg width="28" height="28" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></span>
              <div>
                <div className="font-bold text-base text-[var(--text-primary)]">Settings</div>
                <div className="text-sm text-[var(--text-secondary)]">App configuration, theme, data management, and developer info.</div>
              </div>
            </a>
            {/* Dashboard */}
            <a href="/" className="flex items-center gap-4 p-4 rounded-xl hover:bg-[var(--background)]/60 transition-all group">
              <span className="bg-accent/10 text-accent rounded-2xl p-3 text-2xl shadow-lg group-hover:scale-110 transition-transform"><svg width="28" height="28" fill="none" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="3" stroke="currentColor" strokeWidth="2"/><path d="M7 10h10M7 14h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></span>
              <div>
                <div className="font-bold text-base text-[var(--text-primary)]">Dashboard</div>
                <div className="text-sm text-[var(--text-secondary)]">Welcome, quick stats, and shortcuts to wallets, cards, income, and expenses.</div>
              </div>
            </a>
            {/* Wallets */}
            <a href="/wallets" className="flex items-center gap-4 p-4 rounded-xl hover:bg-[var(--background)]/60 transition-all group">
              <span className="bg-primary/10 text-primary rounded-2xl p-3 text-2xl shadow-lg group-hover:scale-110 transition-transform"><svg width="28" height="28" fill="none" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="13" rx="3" stroke="currentColor" strokeWidth="2"/><path d="M16 3v4M8 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></span>
              <div>
                <div className="font-bold text-base text-[var(--text-primary)]">Wallets</div>
                <div className="text-sm text-[var(--text-secondary)]">Manage your wallets (cash, bank, etc.).</div>
              </div>
            </a>
            {/* Cards */}
            <a href="/cards" className="flex items-center gap-4 p-4 rounded-xl hover:bg-[var(--background)]/60 transition-all group">
              <span className="bg-accent/10 text-accent rounded-2xl p-3 text-2xl shadow-lg group-hover:scale-110 transition-transform"><svg width="28" height="28" fill="none" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="13" rx="3" stroke="currentColor" strokeWidth="2"/><rect x="6" y="15" width="4" height="2" rx="1" fill="currentColor"/></svg></span>
              <div>
                <div className="font-bold text-base text-[var(--text-primary)]">Cards</div>
                <div className="text-sm text-[var(--text-secondary)]">Manage your credit/debit cards.</div>
              </div>
            </a>
            {/* Sources */}
            <a href="/sources" className="flex items-center gap-4 p-4 rounded-xl hover:bg-[var(--background)]/60 transition-all group">
              <span className="bg-success/10 text-success rounded-2xl p-3 text-2xl shadow-lg group-hover:scale-110 transition-transform"><svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M12 20V10M12 10l-4 4M12 10l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></span>
              <div>
                <div className="font-bold text-base text-[var(--text-primary)]">Sources</div>
                <div className="text-sm text-[var(--text-secondary)]">Manage income and expense sources.</div>
              </div>
            </a>
          </div>
        </div>
        {/* Currency Selector Luxury Section */}
        <div className="card glassy-card mb-4 animate-fade-in">
          <h2 className="text-lg font-medium mb-3 flex items-center gap-2"><Globe className="w-5 h-5 text-accent" /> Currency</h2>
          <div className="flex items-center gap-4">
            <select
              className="lux-dropdown px-4 py-2 rounded-xl border border-[var(--glass-border)] bg-[var(--background)] text-lg font-semibold shadow focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              value={currency.code}
              onChange={handleCurrencyChange}
              style={{ minWidth: 120 }}
            >
              {currencyList.map(cur => (
                <option key={cur.code} value={cur.code}>
                  {cur.flag} {cur.code} - {cur.name}
                </option>
              ))}
            </select>
            <span className="text-2xl font-bold">{currency.flag} {currency.symbol}</span>
          </div>
          <div className="text-sm text-[var(--text-secondary)] mt-2">All amounts in the app will use your selected currency.</div>
        </div>
        {/* Configuration Section */}
        <div className="card glassy-card mb-4">
          <h2 className="text-lg font-medium mb-3">Configuration</h2>
          <div className="space-y-2 text-text-secondary text-sm">
            <p>Manage your <a href="/sources" className="text-primary underline">Income & Expense Sources</a>.</p>
            <p>Set your <a href="/wallets" className="text-primary underline">Default Wallet</a> and <a href="/cards" className="text-primary underline">Default Card</a>.</p>
          </div>
        </div>
        {/* Theme Settings */}
        <div className="card">
          <h2 className="text-lg font-medium mb-3">Appearance</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <Moon className="w-5 h-5 text-primary" />
              ) : (
                <Sun className="w-5 h-5 text-warning" />
              )}
              <span>Dark Mode</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={theme === 'dark'} 
                onChange={toggleTheme} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-text-secondary/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
        
        {/* Data Management */}
        <div className="card">
          <h2 className="text-lg font-medium mb-3">Data Management</h2>
          
          <div className="space-y-4">
            {/* Import Data Luxury */}
            <label className="w-full py-3 flex items-center justify-between px-3 rounded-lg hover:bg-background transition-colors cursor-pointer group">
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-success" />
                <span>Import Backup</span>
              </div>
              <input type="file" accept="application/json" className="hidden" onChange={handleImport} />
              <ArrowLeft className="w-5 h-5 rotate-90 text-text-secondary group-hover:text-success" />
            </label>
            {/* Import Feedback */}
            {importStatus !== 'idle' && (
              <div className={`mt-2 text-center rounded-xl py-2 px-4 font-semibold animate-fade-in ${importStatus==='success' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>{importMsg}</div>
            )}
            {/* Export Data */}
            <button 
              onClick={exportData}
              className="w-full py-3 flex items-center justify-between px-3 rounded-lg hover:bg-background transition-colors"
            >
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-primary" />
                <span>Export All Data</span>
              </div>
              <ArrowLeft className="w-5 h-5 rotate-90 text-text-secondary" />
            </button>
            
            {/* Clear Data */}
            <button 
              onClick={() => setShowConfirmation(true)}
              className="w-full py-3 flex items-center justify-between px-3 rounded-lg hover:bg-background transition-colors"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-error" />
                <span>Clear All Data</span>
              </div>
              <ArrowLeft className="w-5 h-5 rotate-90 text-text-secondary" />
            </button>
          </div>
        </div>
        
        {/* Developer Link Luxury Section */}
        <div className="card glassy-card mt-4 luxury-dev-section text-center flex flex-col items-center">
          <h2 className="text-lg font-medium mb-3">Developer</h2>
          <div className="space-y-2 text-text-secondary text-sm mb-3">
            <p className="mt-2">This app is crafted with passion and luxury UI by Abdul Hajees. For feedback, feature requests, or support, feel free to reach out!</p>
          </div>
          {isOnline ? (
            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
              <a
                href="https://paypal.me/abdulhajeess"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary px-6 py-3 rounded-xl font-bold text-lg flex items-center gap-2 shadow-lg hover:scale-105 transition-transform mt-2 justify-center"
                style={{ minWidth: 180 }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="12" fill="#003087"/><path d="M7.5 17.5L8.5 7.5H15.5C17.5 7.5 18.5 8.5 18.5 10.5C18.5 12.5 17.5 13.5 15.5 13.5H10.5L10 17.5H7.5Z" fill="#fff"/><path d="M10.5 13.5L11 9.5H15.5C16.5 9.5 17 10 17 10.5C17 11 16.5 11.5 15.5 11.5H11.5L11 13.5H10.5Z" fill="#009cde"/></svg>
                Buy me a coffee ☕
              </a>
              <a
                href="https://abdulhajees.in"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline px-6 py-3 rounded-xl font-bold text-lg flex items-center gap-2 shadow hover:scale-105 transition-transform mt-2 justify-center border-accent text-accent"
                style={{ minWidth: 180 }}
              >
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/><polyline points="17 8 9 16 7 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
                Contact Me
              </a>
            </div>
          ) : (
            <div className="text-warning">You are offline. Online links are not available.</div>
          )}
        </div>
      </div>
      
      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card-bg rounded-lg max-w-md w-full animate-fade-in p-6">
            <div className="flex items-center gap-3 text-error mb-4">
              <AlertTriangle className="w-6 h-6" />
              <h2 className="text-lg font-semibold">Clear All Data</h2>
            </div>
            
            <p className="mb-4 text-text-secondary">
              This will permanently delete all your transactions and categories. This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirmation(false)} 
                className="btn btn-outline flex-1"
              >
                Cancel
              </button>
              <button 
                onClick={clearAllData} 
                className="btn flex-1 bg-error text-white hover:bg-error/90"
              >
                Yes, Clear All Data
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        .glassy-card, .card {
          background: var(--card-bg, #fff);
          color: var(--text-primary, #1e293b);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.13);
          backdrop-filter: blur(12px);
          border-radius: 20px;
          border: 1px solid var(--glass-border, rgba(255,255,255,0.18));
        }
      `}</style>
    </div>
  );
};

export default Settings;