import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, Category } from '../db/db';
import type { Budget } from '../db/db';
import { CheckCircle, Edit, Home, Car, Book, Smartphone, Utensils, Coffee, Gamepad2, ShoppingBag, Heart, Gift, Briefcase, Film, Music, Globe, Wifi, CreditCard, Wallet, Banknote, PiggyBank, DollarSign, TrendingUp, TrendingDown, GraduationCap } from 'lucide-react';

const icons = [Home, Car, Book, Smartphone, Utensils, Coffee, Gamepad2, ShoppingBag, Heart, Gift, Briefcase, Film, Music, Globe, Wifi, CreditCard, Wallet, Banknote, PiggyBank, DollarSign, TrendingUp, TrendingDown, GraduationCap];
const iconNames = ['Home', 'Car', 'Book', 'Smartphone', 'Utensils', 'Coffee', 'Gamepad2', 'ShoppingBag', 'Heart', 'Gift', 'Briefcase', 'Film', 'Music', 'Globe', 'Wifi', 'CreditCard', 'Wallet', 'Banknote', 'PiggyBank', 'DollarSign', 'TrendingUp', 'TrendingDown', 'GraduationCap'];

const Budget: React.FC = () => {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const categories = useLiveQuery(() => db.categories.where('type').equals('expense').toArray(), []);
  const budgets = useLiveQuery(() => db.budgets.where({ month, year }).toArray(), [month, year]);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState<{ [categoryId: number]: string }>({});
  const [saved, setSaved] = useState<{ [categoryId: number]: boolean }>({});

  const handleEdit = (categoryId: number, value: string) => {
    setForm(f => ({ ...f, [categoryId]: value }));
    setEditing(categoryId);
  };

  const handleSave = async (category: Category) => {
    const value = form[category.id!];
    if (!value || isNaN(Number(value))) return;
    const amount = parseFloat(value);
    const existing = budgets?.find(b => b.categoryId === category.id);
    if (existing) {
      await db.budgets.update(existing.id!, { amount });
    } else {
      await db.budgets.add({
        categoryId: category.id!,
        month,
        year,
        amount,
        createdAt: new Date(),
      });
    }
    setEditing(null);
    setSaved(s => ({ ...s, [category.id!]: true }));
    setTimeout(() => setSaved(s => ({ ...s, [category.id!]: false })), 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--background)] to-[var(--background)] p-4">
      <div className="max-w-lg mx-auto flex flex-col gap-0">
        {/* Summary Card */}
        <div className="clean-glass-card w-full mx-auto mt-8 mb-8 p-6 rounded-2xl shadow-md flex flex-col items-center">
          <div className="text-lg font-semibold tracking-wide text-[var(--text-primary)] mb-2">Budgets Overview</div>
          <div className="flex w-full justify-between gap-2 mt-2">
            <div className="flex-1 flex flex-col items-center">
              <span className="text-xs text-[var(--text-secondary)] mb-1">Expense Categories</span>
              <span className="font-bold text-lg text-[var(--error)]">{(categories||[]).length}</span>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <span className="text-xs text-[var(--text-secondary)] mb-1">Total Budget</span>
              <span className="font-bold text-lg text-[var(--primary)]">₹{(budgets||[]).reduce((sum,b)=>sum+(b.amount||0),0).toFixed(2)}</span>
            </div>
          </div>
        </div>
        {/* Budgets List */}
        <div className="w-full flex flex-col gap-5 px-1">
          {(categories || []).length === 0 && (
            <div className="clean-glass-card text-center text-[var(--text-secondary)] py-10 rounded-xl text-base font-medium">No expense categories found.</div>
          )}
          {(categories || []).map(category => {
            const budget = budgets?.find(b => b.categoryId === category.id);
            const isEditing = editing === category.id;
            const Icon = icons[iconNames.indexOf(category.icon || 'Home')] || Home;
            return (
              <div key={category.id} className="clean-glass-card flex items-center gap-4 p-5 rounded-2xl shadow-sm border border-white/40 relative transition-all duration-200 hover:shadow-md group">
                <span className="text-3xl bg-white/80 rounded-xl p-2 shadow-sm" style={{ color: category.color }}>
                  <Icon />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-base text-[var(--text-primary)] truncate">{category.name}</div>
                  <div className="text-xs text-[var(--text-secondary)]">Set your monthly budget</div>
                </div>
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <input
                        type="number"
                        className="input w-24 text-right font-semibold text-[var(--primary)]"
                        value={form[category.id!] ?? budget?.amount ?? ''}
                        onChange={e => handleEdit(category.id!, e.target.value)}
                        autoFocus
                      />
                      <button
                        className="p-2 rounded-full bg-[var(--primary)]/90 hover:bg-[var(--primary)] text-white shadow transition-colors"
                        onClick={() => handleSave(category)}
                      >
                        <CheckCircle size={20} />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="font-bold text-lg text-[var(--primary)]">
                        ₹{budget?.amount?.toFixed(2) ?? '--'}
                      </span>
                      <button
                        className="p-2 rounded-full bg-white/80 hover:bg-[var(--primary)]/10 text-[var(--primary)] shadow transition-colors"
                        onClick={() => setEditing(category.id!)}
                      >
                        <Edit size={18} />
                      </button>
                    </>
                  )}
                  {saved[category.id!] && (
                    <span className="ml-2 animate-fade-in-smooth text-[var(--success)]"><CheckCircle size={20} /></span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`
        .clean-glass-card {
          background: var(--card-bg, rgba(255,255,255,0.85));
          box-shadow: 0 4px 24px 0 rgba(31, 38, 135, 0.07);
          backdrop-filter: blur(10px);
          border-radius: 18px;
          border: 1px solid var(--glass-border, rgba(255,255,255,0.22));
          transition: box-shadow 0.18s, transform 0.18s, background 0.18s;
        }
        .clean-glass-modal {
          background: var(--card-bg, rgba(255,255,255,0.97));
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.10);
          backdrop-filter: blur(18px);
          border-radius: 24px;
          border: 1px solid var(--glass-border, rgba(255,255,255,0.22));
        }
        .animate-fade-in-smooth {
          animation: fadeInSmooth 0.4s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes fadeInSmooth {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @media (max-width: 640px) {
          .clean-glass-card { padding: 1rem !important; }
          .clean-glass-modal { padding: 1.1rem !important; }
        }
      `}</style>
    </div>
  );
};

export default Budget; 