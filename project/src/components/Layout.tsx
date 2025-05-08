import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';
import { Menu, Plus, ArrowLeft, TrendingUp, TrendingDown, ArrowDownUp, Tag, Wallet, CheckCircle, ArrowRight } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, Transaction } from '../db/db';
import { LuxuryCalculatorInput } from '../pages/Records'; // Import the named export

// Helper to get local ISO string for datetime-local input
function getLocalDateTimeString() {
  const now = new Date();
  now.setSeconds(0, 0);
  const tzOffset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
}

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showGlobalAddModal, setShowGlobalAddModal] = useState(false);

  // Add record modal state (moved from Records)
  const accounts = useLiveQuery(() => db.accounts.toArray(), []) || [];
  const categories = useLiveQuery(() => db.categories.toArray(), []) || [];
  const [form, setForm] = useState({
    type: 'expense',
    category: '',
    icon: '',
    amount: '',
    account: '',
    date: getLocalDateTimeString(),
    color: '',
    toAccount: '',
    notes: '',
  });
  const [accountSelectorOpen, setAccountSelectorOpen] = useState(false);
  const [categorySelectorOpen, setCategorySelectorOpen] = useState(false);
  const [topBarLabel, setTopBarLabel] = useState<string | null>(null);

  const resetForm = () => setForm({
    type: 'expense',
    category: '',
    icon: '',
    amount: '',
    account: '',
    date: getLocalDateTimeString(),
    color: '',
    toAccount: '',
    notes: '',
  });

  const handleSave = async () => {
    if (!form.amount || (!form.category && form.type !== 'transfer') || !form.account || (form.type === 'transfer' && !form.toAccount)) return;
    if (form.type === 'transfer') {
      const fromAcc = (accounts || []).find(a => a.name === form.account);
      const toAcc = (accounts || []).find(a => a.name === form.toAccount);
      if (!fromAcc || !toAcc || fromAcc.name === toAcc.name) return;
      const tx: Transaction = {
        amount: parseFloat(form.amount),
        type: 'transfer',
        categoryId: undefined,
        accountId: fromAcc.id!,
        toAccountId: toAcc.id!,
        date: new Date(form.date),
        notes: form.notes,
        createdAt: new Date(),
      };
      await db.transactions.add(tx);
      setShowGlobalAddModal(false);
      resetForm();
      return;
    }
    const cat = (categories || []).find(c => c.name === form.category && c.type === form.type);
    const acc = (accounts || []).find(a => a.name === form.account);
    if (!cat || !acc) return;
    const tx: Transaction = {
      amount: parseFloat(form.amount),
      type: form.type as 'income' | 'expense' | 'transfer',
      categoryId: cat.id!,
      accountId: acc.id!,
      date: new Date(form.date),
      notes: form.notes,
      createdAt: new Date(),
    };
    await db.transactions.add(tx);
    setShowGlobalAddModal(false);
    resetForm();
  };

  const handleTopBarLabel = (label: string) => {
    setTopBarLabel(label);
    setTimeout(() => setTopBarLabel(null), 1000);
  };

  // Stub backup/restore handlers
  const handleBackup = () => {
    alert('Backup functionality coming soon!');
  };
  const handleRestore = () => {
    alert('Restore functionality coming soon!');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Menu Button */}
      <button
        className="fixed top-5 left-4 z-50 p-3 rounded-full bg-white/80 shadow-lg border border-white/40 hover:bg-primary/10 transition-all"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={26} className="text-[#232946]" />
      </button>
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="flex-1 min-h-0 overflow-y-auto container mx-auto px-4 pb-28 md:pb-8">
        <Outlet />
      </main>
      <BottomNav />
      {/* Global Floating Plus Button */}
      {!sidebarOpen && !showGlobalAddModal && (
        <button
          className="fixed bottom-28 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent shadow-2xl flex items-center justify-center border-4 border-white/60 hover:scale-110 transition-transform focus:outline-none animate-fade-in"
          onClick={() => {
            resetForm();
            setShowGlobalAddModal(true);
          }}
          aria-label="Add Record"
        >
          <Plus size={36} className="text-white drop-shadow-lg" />
        </button>
      )}
      {/* Global Add Record Modal */}
      {showGlobalAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 animate-fade-in overflow-y-auto py-8">
          <div className="lux-glass-modal rounded-3xl p-0 shadow-2xl w-full max-w-md animate-slide-up border border-[var(--glass-border)]/60 overflow-y-auto max-h-[90vh] relative">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--glass-border)]/40 bg-[var(--background)]/80 relative">
              <button onClick={() => { setShowGlobalAddModal(false); handleTopBarLabel('Cancel'); }} className="flex flex-col items-center gap-1 text-yellow-400 font-bold text-lg hover:scale-105 transition-transform" title="Cancel">
                <ArrowLeft className="w-6 h-6" />
                {topBarLabel === 'Cancel' && <span className="text-xs mt-1 animate-fade-in">Cancel</span>}
              </button>
              <div className="flex items-center gap-2 bg-transparent rounded-xl">
                <button
                  className={`px-3 py-1 rounded-xl transition-all duration-200 focus:outline-none flex flex-col items-center justify-center ${form.type === 'income' ? 'bg-yellow-400/90 text-gray-900 shadow-lg scale-105' : 'text-[var(--text-secondary)]'}`}
                  onClick={() => { setForm(f => ({ ...f, type: 'income', category: '', icon: '', color: '', toAccount: '' })); handleTopBarLabel('Income'); }}
                  title="Income"
                >
                  <TrendingUp className="w-6 h-6" />
                  {(form.type === 'income' || topBarLabel === 'Income') && <span className="text-xs mt-1 animate-fade-in">Income</span>}
                </button>
                <button
                  className={`px-3 py-1 rounded-xl transition-all duration-200 focus:outline-none flex flex-col items-center justify-center ${form.type === 'expense' ? 'bg-yellow-400/90 text-gray-900 shadow-lg scale-105' : 'text-[var(--text-secondary)]'}`}
                  onClick={() => { setForm(f => ({ ...f, type: 'expense', category: '', icon: '', color: '', toAccount: '' })); handleTopBarLabel('Expense'); }}
                  title="Expense"
                >
                  <TrendingDown className="w-6 h-6" />
                  {(form.type === 'expense' || topBarLabel === 'Expense') && <span className="text-xs mt-1 animate-fade-in">Expense</span>}
                </button>
                <button
                  className={`px-3 py-1 rounded-xl transition-all duration-200 focus:outline-none flex flex-col items-center justify-center ${form.type === 'transfer' ? 'bg-yellow-400/90 text-gray-900 shadow-lg scale-105' : 'text-[var(--text-secondary)]'}`}
                  onClick={() => { setForm(f => ({ ...f, type: 'transfer', category: '', icon: '', color: '' })); handleTopBarLabel('Transfer'); }}
                  title="Transfer"
                >
                  <ArrowDownUp className="w-6 h-6" />
                  {(form.type === 'transfer' || topBarLabel === 'Transfer') && <span className="text-xs mt-1 animate-fade-in">Transfer</span>}
                </button>
              </div>
              <button onClick={() => { handleSave(); handleTopBarLabel('Save'); }} className="flex flex-col items-center gap-1 text-yellow-400 font-bold text-lg hover:scale-105 transition-transform" title="Save">
                <CheckCircle className="w-6 h-6" />
                {topBarLabel === 'Save' && <span className="text-xs mt-1 animate-fade-in">Save</span>}
              </button>
            </div>
            {/* Selectors */}
            <div className="flex gap-2 px-5 pt-5 pb-2">
              <button onClick={() => setAccountSelectorOpen(true)} className="flex-1 flex items-center gap-2 lux-glass-card px-4 py-4 rounded-2xl border-2 border-yellow-400/40 text-lg font-semibold text-[var(--text-primary)] shadow hover:shadow-lg transition-all duration-200 justify-center">
                {accounts.find(a => a.name === form.account) ? (
                  <><span className="mr-2"><Wallet className="w-6 h-6" /></span>{form.account}</>
                ) : (
                  <><Wallet className="w-6 h-6" /> Account</>
                )}
              </button>
              {form.type === 'transfer' && (
                <button onClick={() => setAccountSelectorOpen(true)} className="flex-1 flex items-center gap-2 lux-glass-card px-4 py-4 rounded-2xl border-2 border-yellow-400/40 text-lg font-semibold text-[var(--text-primary)] shadow hover:shadow-lg transition-all duration-200 justify-center">
                  <ArrowRight className="w-6 h-6 mr-2" />
                  {form.toAccount ? form.toAccount : 'To Account'}
                </button>
              )}
              {form.type !== 'transfer' && (
                <button onClick={() => setCategorySelectorOpen(true)} className="flex-1 flex items-center gap-2 lux-glass-card px-4 py-4 rounded-2xl border-2 border-yellow-400/40 text-lg font-semibold text-[var(--text-primary)] shadow hover:shadow-lg transition-all duration-200 justify-center">
                  {categories.find(c => c.name === form.category && c.type === form.type) ? (
                    <><span className="mr-2"><Tag className="w-6 h-6" /></span>{form.category}</>
                  ) : (
                    <><Tag className="w-6 h-6" /> Category</>
                  )}
                </button>
              )}
            </div>
            {/* Notes */}
            <div className="px-5 pt-2 pb-2">
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="w-full lux-glass-card rounded-2xl p-4 text-base font-medium text-[var(--text-primary)] bg-transparent border-2 border-yellow-400/30 placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-yellow-400/60 transition-all min-h-[70px]" placeholder="Add notes" />
            </div>
            {/* Calculator Keypad */}
            <div className="px-2 pb-2">
              <LuxuryCalculatorInput value={form.amount} onChange={(v: string) => setForm(f => ({ ...f, amount: v }))} />
            </div>
            {/* Date & Time */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--glass-border)]/40 bg-[var(--background)]/80 text-[var(--text-secondary)] text-base font-semibold tracking-wide">
              <label className="flex flex-col w-full">
                <span className="text-xs font-medium text-[var(--text-secondary)] mb-1">Date & Time</span>
                <input
                  type="datetime-local"
                  className="lux-glass-card w-full px-3 py-2 rounded-xl border border-yellow-400/30 text-[var(--text-primary)] bg-transparent focus:outline-none focus:ring-2 focus:ring-yellow-400/60 transition-all"
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  required
                />
              </label>
            </div>
            {/* Account Selector Modal */}
            {accountSelectorOpen && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[120] animate-fade-in">
                <div className="lux-glass-modal rounded-2xl p-6 shadow-2xl w-full max-w-xs animate-fade-in border border-yellow-400/40">
                  <div className="font-bold text-lg mb-4 text-[var(--text-primary)] text-center">Select Account</div>
                  <div className="flex flex-col gap-3">
                    {(accounts || []).map(acc => {
                      return (
                        <button key={acc.id} className={`flex items-center gap-3 lux-glass-card px-4 py-3 rounded-xl border-2 ${form.account === acc.name ? 'border-yellow-400' : 'border-transparent'} text-lg font-semibold text-[var(--text-primary)] shadow hover:shadow-lg transition-all duration-200`} onClick={() => { setForm(f => ({ ...f, account: acc.name || '' })); setAccountSelectorOpen(false); }}>
                          <span className="text-2xl" style={{ color: acc.color }}><Wallet /></span>
                          {acc.name}
                        </button>
                      );
                    })}
                  </div>
                  <button onClick={() => setAccountSelectorOpen(false)} className="mt-6 w-full btn btn-outline">Close</button>
                </div>
              </div>
            )}
            {/* Category Selector Modal */}
            {categorySelectorOpen && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[120] animate-fade-in">
                <div className="lux-glass-modal rounded-2xl p-6 shadow-2xl w-full max-w-xs animate-fade-in border border-yellow-400/40">
                  <div className="font-bold text-lg mb-4 text-[var(--text-primary)] text-center">Select Category</div>
                  <div className="flex flex-col gap-3">
                    {(categories || []).filter(c => c.type === form.type).map(cat => {
                      return (
                        <button key={cat.id} className={`flex items-center gap-3 lux-glass-card px-4 py-3 rounded-xl border-2 ${form.category === cat.name ? 'border-yellow-400' : 'border-transparent'} text-lg font-semibold text-[var(--text-primary)] shadow hover:shadow-lg transition-all duration-200`} onClick={() => { setForm(f => ({ ...f, category: cat.name || '', icon: cat.icon || '', color: cat.color || '' })); setCategorySelectorOpen(false); }}>
                          <span className="text-2xl" style={{ color: cat.color }}><Tag /></span>
                          {cat.name}
                        </button>
                      );
                    })}
                  </div>
                  <button onClick={() => setCategorySelectorOpen(false)} className="mt-6 w-full btn btn-outline">Close</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;