import React, { useState, useRef, useEffect } from 'react';
import { Plus, ArrowRight, ArrowLeft, ArrowDown, ArrowUp, ArrowDownUp, Home, Car, Book, Smartphone, Utensils, Coffee, Gamepad2, ShoppingBag, Heart, Gift, Briefcase, Film, Music, Globe, Wifi, CreditCard, Wallet, Banknote, PiggyBank, DollarSign, TrendingUp, TrendingDown, Tag, Trash2, EditIcon, CheckCircle } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

const icons = [Home, Car, Book, Smartphone, Utensils, Coffee, Gamepad2, ShoppingBag, Heart, Gift, Briefcase, Film, Music, Globe, Wifi, CreditCard, Wallet, Banknote, PiggyBank, DollarSign, TrendingUp, TrendingDown];
const iconNames = ['Home', 'Car', 'Book', 'Smartphone', 'Utensils', 'Coffee', 'Gamepad2', 'ShoppingBag', 'Heart', 'Gift', 'Briefcase', 'Film', 'Music', 'Globe', 'Wifi', 'CreditCard', 'Wallet', 'Banknote', 'PiggyBank', 'DollarSign', 'TrendingUp', 'TrendingDown'];

type RecordType = {
  id: number;
  date: string;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  icon: string;
  amount: number;
  account: string;
  color: string;
};

type AccountType = {
  id: number;
  name: string;
  icon: string;
  color: string;
};

type CategoryType = {
  id: number;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
};

function groupByDate(records: RecordType[]): Record<string, RecordType[]> {
  return records.reduce((acc: Record<string, RecordType[]>, rec: RecordType) => {
    acc[rec.date] = acc[rec.date] || [];
    acc[rec.date].push(rec);
    return acc;
  }, {});
}

const RECORD_TYPES = ['income', 'expense', 'transfer'] as const;
type RecordTypeType = typeof RECORD_TYPES[number];

type FormType = {
  type: RecordTypeType;
  category: string;
  icon: string;
  amount: string;
  account: string;
  date: string;
  color: string;
  toAccount: string;
  notes: string;
};

// Helper to get local ISO string for datetime-local input
function getLocalDateTimeString() {
  const now = new Date();
  now.setSeconds(0, 0);
  const tzOffset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
}

const Records: React.FC = () => {
  const transactions = useLiveQuery(() => db.transactions.orderBy('date').reverse().toArray(), []) || [];
  const accounts = useLiveQuery(() => db.accounts.toArray(), []) || [];
  const categories = useLiveQuery(() => db.categories.toArray(), []) || [];
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FormType>({
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
  const accountBtnRef = useRef<HTMLButtonElement>(null);
  const categoryBtnRef = useRef<HTMLButtonElement>(null);
  const [viewRecord, setViewRecord] = useState<any | null>(null);
  const [topBarLabel, setTopBarLabel] = useState<string | null>(null);

  // Helper to reset form
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

  // Add or update transaction
  const handleSave = async () => {
    if (!form.amount || (!form.category && form.type !== 'transfer') || !form.account || (form.type === 'transfer' && !form.toAccount)) return;
    if (form.type === 'transfer') {
      const fromAcc = (accounts || []).find(a => a.name === form.account);
      const toAcc = (accounts || []).find(a => a.name === form.toAccount);
      if (!fromAcc || !toAcc || fromAcc.name === toAcc.name) return;
      const tx = {
        amount: parseFloat(form.amount),
        type: 'transfer' as const,
        categoryId: undefined,
        accountId: fromAcc.id!,
        toAccountId: toAcc.id!,
        date: new Date(form.date),
        notes: form.notes,
        createdAt: new Date(),
      };
      await db.transactions.add(tx);
      setShowModal(false);
      setEditId(null);
      resetForm();
      return;
    }
    const cat = (categories || []).find(c => c.name === form.category && c.type === form.type);
    const acc = (accounts || []).find(a => a.name === form.account);
    if (!cat || !acc) return;
    const tx = {
      amount: parseFloat(form.amount),
      type: form.type,
      categoryId: cat.id!,
      accountId: acc.id!,
      date: new Date(form.date),
      notes: form.notes,
      createdAt: new Date(),
    };
    if (editId) {
      await db.transactions.update(editId, tx);
    } else {
      await db.transactions.add(tx);
    }
    setShowModal(false);
    setEditId(null);
    resetForm();
  };

  // Edit transaction
  const handleEdit = (tx: any) => {
    const cat = (categories || []).find(c => c.id === tx.categoryId);
    const acc = (accounts || []).find(a => a.id === tx.accountId);
    setForm({
      type: (tx.type === 'income' || tx.type === 'expense') ? tx.type : 'expense',
      category: cat?.name || '',
      icon: cat?.icon || '',
      amount: tx.amount?.toString() || '',
      account: acc?.name || '',
      date: tx.date ? new Date(tx.date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
      color: cat?.color || '',
      toAccount: '',
      notes: tx.notes || '',
    });
    setEditId(tx.id);
    setShowModal(true);
  };

  // Delete transaction
  const handleDelete = async (id: number) => {
    await db.transactions.delete(id);
  };

  // Group by date (but keep records sorted by exact time, newest first)
  const sortedTransactions = [...(transactions || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const grouped = sortedTransactions.reduce((acc: Record<string, any[]>, rec: any) => {
    const date = new Date(rec.date).toLocaleDateString();
    acc[date] = acc[date] || [];
    acc[date].push(rec);
    return acc;
  }, {});
  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  // Records within each date are already sorted by time (newest first)

  // Fix linter errors for icon index lookup
  const getIconIndex = (icon: string | undefined) => iconNames.indexOf(icon || '');

  // Calculate summary values
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  // Total should be sum of all current account balances
  const getAccountBalance = (accountId: number) => {
    return (transactions || []).reduce((sum, tx) => {
      if (tx.accountId === accountId) {
        return sum + (tx.type === 'income' ? tx.amount : -tx.amount);
      }
      return sum;
    }, 0);
  };
  const totalBalance = (accounts || []).filter(acc => typeof acc.id === 'number').reduce((sum, acc) => sum + getAccountBalance(acc.id as number), 0);

  // Helper to recalculate balances based on initial value and all transactions
  const recalculateAccountBalances = async () => {
    for (const acc of accounts) {
      // Start from 0, only sum transactions
      let balance = 0;
      transactions.forEach(tx => {
        if (tx.accountId === acc.id) {
          balance += tx.type === 'income' ? tx.amount : -tx.amount;
        }
      });
      if (typeof acc.id === 'number') {
        await db.accounts.update(acc.id, { balance });
      }
    }
  };

  useEffect(() => {
    if (!accounts.length) return;
    recalculateAccountBalances();
  }, [transactions, accounts]);

  // When deleting an account, also delete all transactions for that account
  const handleDeleteAccount = async (accountId: number) => {
    await db.accounts.delete(accountId);
    const txs = transactions.filter(tx => tx.accountId === accountId);
    for (const tx of txs) {
      if (typeof tx.id === 'number') {
        await db.transactions.delete(tx.id);
      }
    }
  };

  const handleTopBarLabel = (label: string) => {
    setTopBarLabel(label);
    setTimeout(() => setTopBarLabel(null), 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--background)] to-[var(--background)] p-2 animate-fade-in">
      <div className="max-w-lg mx-auto">
        <div className="w-full flex justify-between items-center rounded-2xl lux-glass-card px-6 py-4 mb-6 mt-4 shadow-lg border border-[var(--glass-border)]">
          <div className="flex flex-col items-center flex-1">
            <span className="text-xs text-[var(--text-secondary)] font-medium mb-1">EXPENSE</span>
            <span className="font-bold text-lg text-[var(--error)]">₹{totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex flex-col items-center flex-1">
            <span className="text-xs text-[var(--text-secondary)] font-medium mb-1">INCOME</span>
            <span className="font-bold text-lg text-[var(--success)]">₹{totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex flex-col items-center flex-1">
            <span className="text-xs text-[var(--text-secondary)] font-medium mb-1">TOTAL</span>
            <span className="font-bold text-lg text-[var(--primary)]">₹{totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
        {sortedDates.map(date => (
          <div key={date} className="mb-8">
            <div className="text-base font-bold mb-2 text-[var(--text-primary)] tracking-wide flex items-center gap-2">
              <span className="uppercase text-[var(--text-secondary)]">{date}</span>
            </div>
            <div className="flex flex-col gap-2">
              {(grouped[date] || []).map((rec: any) => {
                const cat = categories.find(c => c.id === rec.categoryId);
                const acc = accounts.find(a => a.id === rec.accountId);
                const Icon = icons[getIconIndex(cat?.icon)] || Tag;
                const isIncome = rec.type === 'income';
                const isExpense = rec.type === 'expense';
                return (
                  <div key={rec.id} className="lux-glass-card flex items-center gap-4 p-4 rounded-2xl shadow-sm border border-white/10 relative transition-all duration-200 hover:shadow-md group cursor-pointer" onClick={() => setViewRecord(rec)}>
                    <span className="text-3xl rounded-xl p-2 shadow-sm bg-white/80" style={{ color: cat?.color || 'var(--primary)' }}><Icon /></span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-base text-[var(--text-primary)] truncate">{cat?.name || 'Unknown'}</div>
                      <div className="flex gap-2 mt-1">
                        {acc && (
                          <span className="px-2 py-0.5 rounded-lg text-xs font-medium bg-[var(--background)]/60 border border-[var(--glass-border)] text-[var(--text-secondary)] flex items-center gap-1">
                            {accounts.length > 1 ? <Wallet className="w-4 h-4" /> : null}{acc.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end min-w-[90px]">
                      <span className={`font-bold text-lg ${isExpense ? 'text-[var(--error)]' : isIncome ? 'text-[var(--success)]' : 'text-[var(--primary)]'}`}>{isExpense ? '-' : isIncome ? '+' : ''}₹{rec.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {/* Add Record Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 animate-fade-in overflow-y-auto py-8">
          <div className="lux-glass-modal rounded-3xl p-0 shadow-2xl w-full max-w-md animate-slide-up border border-[var(--glass-border)]/60 overflow-y-auto max-h-[90vh] relative">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--glass-border)]/40 bg-[var(--background)]/80 relative">
              <button onClick={() => { setShowModal(false); handleTopBarLabel('Cancel'); }} className="flex flex-col items-center gap-1 text-yellow-400 font-bold text-lg hover:scale-105 transition-transform" title="Cancel">
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
              <button ref={accountBtnRef} onClick={() => setAccountSelectorOpen(true)} className="flex-1 flex items-center gap-2 lux-glass-card px-4 py-4 rounded-2xl border-2 border-yellow-400/40 text-lg font-semibold text-[var(--text-primary)] shadow hover:shadow-lg transition-all duration-200 justify-center">
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
                <button ref={categoryBtnRef} onClick={() => setCategorySelectorOpen(true)} className="flex-1 flex items-center gap-2 lux-glass-card px-4 py-4 rounded-2xl border-2 border-yellow-400/40 text-lg font-semibold text-[var(--text-primary)] shadow hover:shadow-lg transition-all duration-200 justify-center">
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
              <textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full lux-glass-card rounded-2xl p-4 text-base font-medium text-[var(--text-primary)] bg-transparent border-2 border-yellow-400/30 placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-yellow-400/60 transition-all min-h-[70px]"
                placeholder="Add notes"
              />
            </div>
            {/* Calculator Keypad */}
            <div className="px-2 pb-2">
              <LuxuryCalculatorInput value={form.amount} onChange={v => setForm(f => ({ ...f, amount: v }))} />
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
                      const Icon = icons[getIconIndex(acc.icon)] || Wallet;
                      return (
                        <button key={acc.id} className={`flex items-center gap-3 lux-glass-card px-4 py-3 rounded-xl border-2 ${form.account === acc.name ? 'border-yellow-400' : 'border-transparent'} text-lg font-semibold text-[var(--text-primary)] shadow hover:shadow-lg transition-all duration-200`} onClick={() => { setForm(f => ({ ...f, account: acc.name || '' })); setAccountSelectorOpen(false); }}>
                          <span className="text-2xl" style={{ color: acc.color }}><Icon /></span>
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
                      const Icon = icons[getIconIndex(cat.icon)] || Tag;
                      return (
                        <button key={cat.id} className={`flex items-center gap-3 lux-glass-card px-4 py-3 rounded-xl border-2 ${form.category === cat.name ? 'border-yellow-400' : 'border-transparent'} text-lg font-semibold text-[var(--text-primary)] shadow hover:shadow-lg transition-all duration-200`} onClick={() => { setForm(f => ({ ...f, category: cat.name || '', icon: cat.icon || '', color: cat.color || '' })); setCategorySelectorOpen(false); }}>
                          <span className="text-2xl" style={{ color: cat.color }}><Icon /></span>
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
      {/* Record View Modal */}
      {viewRecord && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[120] animate-fade-in">
          <div className="lux-glass-modal luxury-record-modal rounded-3xl p-0 shadow-2xl w-full max-w-md animate-slide-up border border-[var(--glass-border)]/80 overflow-hidden relative">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--glass-border)]/40 bg-[var(--background)]/90">
              <button onClick={() => setViewRecord(null)} className="flex items-center gap-2 text-yellow-400 font-bold text-lg hover:scale-105 transition-transform">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-3">
                <button onClick={() => { handleDelete(viewRecord.id); setViewRecord(null); }} className="p-2 rounded-full bg-white/90 hover:bg-[var(--error)]/10 text-[var(--error)] shadow transition-colors focus:ring-2 focus:ring-[var(--error)] focus:outline-none"><Trash2 size={22} /></button>
                <button onClick={() => { handleEdit(viewRecord); setViewRecord(null); }} className="p-2 rounded-full bg-white/90 hover:bg-[var(--primary)]/10 text-[var(--primary)] shadow transition-colors focus:ring-2 focus:ring-[var(--primary)] focus:outline-none"><EditIcon size={22} /></button>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center px-8 py-8 bg-[var(--background)]/90">
              <div className={`text-lg font-semibold mb-2 ${viewRecord.type === 'expense' ? 'text-[var(--error)]' : 'text-[var(--success)]'}`}>{viewRecord.type.toUpperCase()}</div>
              <div className={`text-4xl font-extrabold mb-2 ${viewRecord.type === 'expense' ? 'text-[var(--error)]' : 'text-[var(--success)]'}`}>{viewRecord.type === 'expense' ? '-' : '+'}₹{viewRecord.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              <div className="text-base text-[var(--text-secondary)] mb-6">{new Date(viewRecord.date).toLocaleString(undefined, { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</div>
              <div className="w-full flex flex-col gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-[var(--text-primary)]">Account</span>
                  <span className="flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-[var(--glass-border)] bg-[var(--background)]/80 text-lg font-semibold">
                    {(() => { const acc = accounts.find(a => a.id === viewRecord.accountId); const Icon = icons[getIconIndex(acc?.icon)] || Wallet; return <span className="text-xl" style={{ color: acc?.color }}>{<Icon />}</span>; })()}
                    {(() => { const acc = accounts.find(a => a.id === viewRecord.accountId); return acc?.name || 'Unknown'; })()}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-[var(--text-primary)]">Category</span>
                  <span className="flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-[var(--glass-border)] bg-[var(--background)]/80 text-lg font-semibold">
                    {(() => { const cat = categories.find(c => c.id === viewRecord.categoryId); const Icon = icons[getIconIndex(cat?.icon)] || Tag; return <span className="text-xl" style={{ color: cat?.color }}>{<Icon />}</span>; })()}
                    {(() => { const cat = categories.find(c => c.id === viewRecord.categoryId); return cat?.name || 'Unknown'; })()}
                  </span>
                </div>
              </div>
              <div className="w-full text-center text-base font-medium text-[var(--text-primary)] mt-4 luxury-note-box px-4 py-3 rounded-xl border border-[var(--glass-border)] bg-[var(--background)]/95 shadow-lg" style={{wordBreak:'break-word', minHeight:'2.5em'}}>
                {viewRecord.notes || <span className="text-[var(--text-secondary)]">No notes</span>}
              </div>
            </div>
          </div>
        </div>
      )}
      <style>{`
        .glassy-card {
          background: rgba(255,255,255,0.7);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
          backdrop-filter: blur(12px);
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.18);
        }
        .lux-glass-modal {
          background: rgba(30, 32, 40, 0.55);
          box-shadow: 0 12px 48px 0 rgba(31, 38, 135, 0.18);
          backdrop-filter: blur(32px) saturate(1.5);
          border-radius: 32px;
          border: 1.5px solid var(--glass-border, rgba(255,255,255,0.22));
          transition: box-shadow 0.18s, transform 0.18s, background 0.18s;
        }
        .lux-glass-card {
          background: rgba(255,255,255,0.18);
          box-shadow: 0 2px 12px 0 rgba(31, 38, 135, 0.10);
          backdrop-filter: blur(18px) saturate(1.3);
          border-radius: 18px;
          border: 1.5px solid var(--glass-border, rgba(255,255,255,0.22));
          transition: box-shadow 0.18s, transform 0.18s, background 0.18s;
        }
        .luxury-record-modal {
          background: linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(240,240,255,0.92) 100%);
          box-shadow: 0 12px 48px 0 rgba(31, 38, 135, 0.22);
          border-radius: 32px;
          border: 2px solid var(--glass-border, rgba(255,255,255,0.32));
        }
        [data-theme='dark'] .luxury-record-modal {
          background: linear-gradient(135deg, rgba(30,32,40,0.98) 0%, rgba(40,44,60,0.98) 100%);
          box-shadow: 0 12px 48px 0 rgba(31, 38, 135, 0.32);
          border: 2px solid var(--glass-border, rgba(255,255,255,0.18));
        }
        .luxury-note-box {
          background: var(--card-bg, rgba(255,255,255,0.98));
          color: var(--text-primary);
          border: 1.5px solid var(--glass-border, rgba(255,255,255,0.22));
          box-shadow: 0 2px 12px 0 rgba(31, 38, 135, 0.10);
        }
        [data-theme='dark'] .luxury-note-box {
          background: rgba(30,32,40,0.98);
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
};

// Calculator input component
function LuxuryCalculatorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [input, setInput] = useState<string>(value || '0');

  const calculateResult = (expression: string): string => {
    try {
      // Replace × with * and ÷ with /
      const sanitizedExpression = expression.replace(/×/g, '*').replace(/÷/g, '/');
      
      // Split the expression into numbers and operators
      const tokens = sanitizedExpression.match(/(\d*\.?\d+|[+\-*/])/g) || [];
      
      if (tokens.length === 0) return '0';
      
      let result = parseFloat(tokens[0]);
      
      for (let i = 1; i < tokens.length; i += 2) {
        const operator = tokens[i];
        const operand = parseFloat(tokens[i + 1] || '0');
        
        switch (operator) {
          case '+':
            result += operand;
            break;
          case '-':
            result -= operand;
            break;
          case '*':
            result *= operand;
            break;
          case '/':
            if (operand === 0) throw new Error('Division by zero');
            result /= operand;
            break;
          default:
            throw new Error('Invalid operator');
        }
      }
      
      return result.toString();
    } catch {
      return '0';
    }
  };

  const handleButton = (val: string) => {
    if (val === 'C') setInput('0');
    else if (val === '=') {
      const result = calculateResult(input);
      setInput(result);
      onChange(result);
    } else if (val === '⌫') {
      setInput(input.length > 1 ? input.slice(0, -1) : '0');
    } else {
      setInput(input === '0' ? val : input + val);
    }
    if (val !== '=' && val !== '⌫') onChange(input === '0' ? val : input + val);
    if (val === 'C') onChange('0');
    if (val === '⌫') onChange(input.length > 1 ? input.slice(0, -1) : '0');
  };

  const keys = [
    ['+', '7', '8', '9'],
    ['-', '4', '5', '6'],
    ['×', '1', '2', '3'],
    ['÷', '0', '.', '='],
    ['C', '⌫']
  ];
  const opMap: Record<string, string> = { '×': '*', '÷': '/' };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="luxury-calc-container-pro w-full max-w-md mx-auto rounded-2xl shadow-xl border border-[var(--glass-border)]/60 bg-gradient-to-br from-[var(--background)]/90 via-white/60 to-[var(--background)]/95 backdrop-blur-xl p-6 mb-2">
        <div className="w-full flex items-center justify-end mb-6 px-2">
          <span className="luxury-calc-display-pro text-5xl font-extrabold tracking-tight select-all" style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>{input}</span>
        </div>
        <div className="grid grid-cols-4 gap-3 w-full luxury-calc-keypad-pro">
          {['+', '7', '8', '9', '-', '4', '5', '6', '×', '1', '2', '3', '÷', '0', '.', '=', 'C', '⌫'].map((val, idx) => (
            <button
              key={val}
              className={`luxury-calc-btn-pro h-14 text-2xl font-semibold rounded-xl border transition-all duration-150 focus:outline-none active:scale-98 ${
                val === '='
                  ? 'bg-primary text-white border-primary'
                  : val === 'C' || val === '⌫'
                  ? 'bg-error/10 text-error border-error/20'
                  : 'bg-white/60 dark:bg-background/80 text-[var(--text-primary)] border-[var(--glass-border)]/40'
              }`}
              style={{ gridColumn: val === '=' ? 'span 1' : undefined }}
              onClick={() => handleButton(opMap[val] || val)}
            >
              {val}
            </button>
          ))}
        </div>
      </div>
      <style>{`
        .luxury-calc-container-pro {
          box-shadow: 0 4px 32px 0 rgba(31, 38, 135, 0.10);
          border-radius: 1.5rem;
          background: linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(240,240,255,0.97) 100%);
          border: 1.5px solid var(--glass-border, rgba(255,255,255,0.18));
        }
        [data-theme='dark'] .luxury-calc-container-pro {
          background: linear-gradient(135deg, rgba(30,32,40,0.98) 0%, rgba(40,44,60,0.98) 100%);
          box-shadow: 0 4px 32px 0 rgba(31, 38, 135, 0.18);
        }
        .luxury-calc-display-pro {
          color: var(--primary, #a78bfa);
          background: none;
          text-shadow: none;
        }
        .luxury-calc-keypad-pro {
          margin-top: 0.5rem;
        }
        .luxury-calc-btn-pro {
          box-shadow: 0 1.5px 6px 0 rgba(31, 38, 135, 0.06);
          border-radius: 1rem;
          background-clip: padding-box;
          transition: box-shadow 0.12s, transform 0.12s, background 0.12s;
        }
        .luxury-calc-btn-pro:active {
          transform: scale(0.98);
          box-shadow: 0 1px 2px 0 rgba(31, 38, 135, 0.08);
        }
        .luxury-calc-btn-pro:focus {
          outline: none;
          box-shadow: 0 0 0 2px var(--primary, #a78bfa), 0 1.5px 6px 0 rgba(31, 38, 135, 0.06);
        }
      `}</style>
    </div>
  );
}

export default Records;
export { LuxuryCalculatorInput }; 