import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, Category as DBCategory } from '../db/db';
import { Edit as EditIcon, Trash2, Home, Car, Book, Smartphone, Utensils, Coffee, Gamepad2, ShoppingBag, Heart, Gift, Briefcase, Film, Music, Globe, Wifi, CreditCard, Wallet, Banknote, PiggyBank, DollarSign, TrendingUp, TrendingDown, GraduationCap } from 'lucide-react';

const icons = [Home, Car, Book, Smartphone, Utensils, Coffee, Gamepad2, ShoppingBag, Heart, Gift, Briefcase, Film, Music, Globe, Wifi, CreditCard, Wallet, Banknote, PiggyBank, DollarSign, TrendingUp, TrendingDown, GraduationCap];
const iconNames = ['Home', 'Car', 'Book', 'Smartphone', 'Utensils', 'Coffee', 'Gamepad2', 'ShoppingBag', 'Heart', 'Gift', 'Briefcase', 'Film', 'Music', 'Globe', 'Wifi', 'CreditCard', 'Wallet', 'Banknote', 'PiggyBank', 'DollarSign', 'TrendingUp', 'TrendingDown', 'GraduationCap'];

type CategoryType = DBCategory & { id: number };

const Categories: React.FC = () => {
  const categories = useLiveQuery(() => db.categories.toArray(), []);
  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState<null | CategoryType>(null);
  const [form, setForm] = useState<{ type: 'income' | 'expense'; name: string; icon: string; color: string }>({ type: 'income', name: '', icon: 'Home', color: '#0ea5e9' });
  const [error, setError] = useState<string | null>(null);

  const openModal = (type: 'income' | 'expense', category: CategoryType | null = null) => {
    setEditCategory(category);
    setForm(category ? { type: category.type, name: category.name, icon: category.icon || 'Home', color: category.color || '#0ea5e9' } : { type, name: '', icon: 'Home', color: '#0ea5e9' });
    setError(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditCategory(null);
    setError(null);
  };

  const handleSave = async () => {
    setError(null);
    if (!form.name) {
      setError('Category name is required.');
      return;
    }
    if (!form.type || (form.type !== 'income' && form.type !== 'expense')) {
      setError('Category type is required.');
      return;
    }
    try {
      if (editCategory) {
        await db.categories.update(editCategory.id, {
          name: form.name,
          type: form.type,
          icon: form.icon,
          color: form.color,
        });
      } else {
        await db.categories.add({
          name: form.name,
          type: form.type,
          icon: form.icon,
          color: form.color,
          createdAt: new Date(),
        });
      }
      closeModal();
    } catch (e: any) {
      setError('Failed to save category: ' + (e?.message || e));
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    await db.categories.delete(id);
  };

  const incomeCategories = (categories || []).filter(c => c.type === 'income');
  const expenseCategories = (categories || []).filter(c => c.type === 'expense');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--background)] to-[var(--background)] p-4">
      <div className="max-w-lg mx-auto flex flex-col gap-0">
        {/* Summary Card */}
        <div className="clean-glass-card w-full mx-auto mt-8 mb-8 p-6 rounded-2xl shadow-md flex flex-col items-center">
          <div className="text-lg font-semibold tracking-wide text-[var(--text-primary)] mb-2">Categories Overview</div>
          <div className="flex w-full justify-between gap-2 mt-2">
            <div className="flex-1 flex flex-col items-center">
              <span className="text-xs text-[var(--text-secondary)] mb-1">Income</span>
              <span className="font-bold text-lg text-[var(--success)]">{incomeCategories.length}</span>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <span className="text-xs text-[var(--text-secondary)] mb-1">Expense</span>
              <span className="font-bold text-lg text-[var(--error)]">{expenseCategories.length}</span>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <span className="text-xs text-[var(--text-secondary)] mb-1">Total</span>
              <span className="font-bold text-lg text-[var(--primary)]">{(categories || []).length}</span>
            </div>
          </div>
        </div>
        {/* Categories List */}
        <div className="w-full flex flex-col gap-5 px-1">
          <div className="font-bold text-base mb-2 text-[var(--text-primary)] tracking-wide">Income Categories</div>
          {incomeCategories.length === 0 && (
            <div className="clean-glass-card text-center text-[var(--text-secondary)] py-8 rounded-xl text-base font-medium">No income categories yet.</div>
          )}
          {incomeCategories.map(cat => {
            if (typeof cat.id !== 'number') return null;
            const Icon = icons[iconNames.indexOf(cat.icon || 'Home')] || Home;
            return (
              <div key={cat.id} className="clean-glass-card flex items-center gap-4 p-5 rounded-2xl shadow-sm border border-white/40 relative transition-all duration-200 hover:shadow-md group">
                <span className="text-3xl bg-white/80 rounded-xl p-2 shadow-sm" style={{ color: cat.color }}><Icon /></span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-base text-[var(--text-primary)] truncate">{cat.name}</div>
                  <div className="text-xs text-[var(--success)] font-medium">Income</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openModal('income', cat as CategoryType)} className="p-2 rounded-full bg-white/80 hover:bg-[var(--primary)]/10 text-[var(--primary)] shadow transition-colors focus:ring-2 focus:ring-[var(--primary)] focus:outline-none"><EditIcon size={18} /></button>
                  <button onClick={() => cat.id !== undefined && handleDelete(cat.id)} className="p-2 rounded-full bg-white/80 hover:bg-[var(--error)]/10 text-[var(--error)] shadow transition-colors focus:ring-2 focus:ring-[var(--error)] focus:outline-none"><Trash2 size={18} /></button>
                </div>
              </div>
            );
          })}
          <div className="font-bold text-base mb-2 mt-8 text-[var(--text-primary)] tracking-wide">Expense Categories</div>
          {expenseCategories.length === 0 && (
            <div className="clean-glass-card text-center text-[var(--text-secondary)] py-8 rounded-xl text-base font-medium">No expense categories yet.</div>
          )}
          {expenseCategories.map(cat => {
            if (typeof cat.id !== 'number') return null;
            const Icon = icons[iconNames.indexOf(cat.icon || 'Home')] || Home;
            return (
              <div key={cat.id} className="clean-glass-card flex items-center gap-4 p-5 rounded-2xl shadow-sm border border-white/40 relative transition-all duration-200 hover:shadow-md group">
                <span className="text-3xl bg-white/80 rounded-xl p-2 shadow-sm" style={{ color: cat.color }}><Icon /></span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-base text-[var(--text-primary)] truncate">{cat.name}</div>
                  <div className="text-xs text-[var(--error)] font-medium">Expense</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openModal('expense', cat as CategoryType)} className="p-2 rounded-full bg-white/80 hover:bg-[var(--primary)]/10 text-[var(--primary)] shadow transition-colors focus:ring-2 focus:ring-[var(--primary)] focus:outline-none"><EditIcon size={18} /></button>
                  <button onClick={() => cat.id !== undefined && handleDelete(cat.id)} className="p-2 rounded-full bg-white/80 hover:bg-[var(--error)]/10 text-[var(--error)] shadow transition-colors focus:ring-2 focus:ring-[var(--error)] focus:outline-none"><Trash2 size={18} /></button>
                </div>
              </div>
            );
          })}
        </div>
        {/* Add Category Button (block, after list) */}
        <button
          onClick={() => openModal('expense', null)}
          className="w-full mt-8 py-3 rounded-2xl clean-glass-card shadow-md flex items-center justify-center gap-3 text-base font-semibold text-[var(--text-primary)] hover:bg-[var(--background)] hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          style={{letterSpacing: '0.02em'}}>
          Add Category
        </button>
      </div>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] animate-fade-in-smooth">
          <div className="clean-glass-modal rounded-2xl p-8 shadow-2xl w-full max-w-md animate-fade-in-smooth border border-[var(--background)]/60">
            <h2 className="text-xl font-bold mb-6 text-[var(--text-primary)] text-center">{editCategory ? 'Edit Category' : 'Add Category'}</h2>
            <div className="space-y-5">
              {error && <div className="text-[var(--error)] bg-[var(--error)]/10 rounded-lg p-2 text-center animate-fade-in-smooth">{error}</div>}
              <div className="flex gap-2">
                <button className={`btn flex-1 ${form.type === 'income' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setForm(f => ({ ...f, type: 'income' }))}>Income</button>
                <button className={`btn flex-1 ${form.type === 'expense' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setForm(f => ({ ...f, type: 'expense' }))}>Expense</button>
              </div>
              <input type="text" placeholder="Category Name" className="input bg-white/80 text-[var(--text-primary)] placeholder-[var(--text-secondary)] font-medium" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <div className="flex gap-2 items-center">
                <span className="font-medium text-[var(--text-primary)]">Color:</span>
                <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="w-8 h-8 rounded-full border-none" />
              </div>
              <div className="flex gap-2 items-center flex-wrap">
                <span className="font-medium text-[var(--text-primary)]">Icon:</span>
                {icons.map((Icon, idx) => (
                  <button key={iconNames[idx]} className={`p-2 rounded-full border-2 ${form.icon === iconNames[idx] ? 'border-[var(--primary)]' : 'border-transparent'} bg-white/90 hover:bg-[var(--primary)]/10 transition-colors`} onClick={() => setForm({ ...form, icon: iconNames[idx] })}><Icon /></button>
                ))}
              </div>
              <div className="flex gap-3 mt-8">
                <button onClick={closeModal} className="btn btn-outline flex-1">Cancel</button>
                <button onClick={handleSave} className="btn btn-primary flex-1 flex items-center justify-center gap-2">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
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

export default Categories;