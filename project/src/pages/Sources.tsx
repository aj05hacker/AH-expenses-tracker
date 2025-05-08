import React, { useState } from 'react';
import { Plus, Edit, Trash2, TrendingUp, TrendingDown, Check, Move } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

const iconOptions = [
  { name: 'TrendingUp', icon: <TrendingUp /> },
  { name: 'TrendingDown', icon: <TrendingDown /> },
  { name: 'Move', icon: <Move /> },
];

type SourceType = {
  id: number;
  name: string;
  color: string;
  icon: string;
  type: 'income' | 'expense';
  createdAt: Date;
};

const Sources: React.FC = () => {
  const incomeSources = useLiveQuery(() => db.categories.where('type').equals('income').toArray(), []);
  const expenseSources = useLiveQuery(() => db.categories.where('type').equals('expense').toArray(), []);
  const [tab, setTab] = useState<'income' | 'expense'>('income');
  const [showModal, setShowModal] = useState(false);
  const [editSource, setEditSource] = useState<SourceType | null>(null);
  const [form, setForm] = useState<Omit<SourceType, 'id'>>({ name: '', color: '#6EE7B7', icon: 'TrendingUp', type: 'income', createdAt: new Date() });
  const [error, setError] = useState<string | null>(null);

  const sources = tab === 'income' ? incomeSources : expenseSources;

  const openModal = (source: SourceType | null = null) => {
    setEditSource(source);
    setForm(source ? { name: source.name, color: source.color, icon: source.icon, type: source.type, createdAt: source.createdAt } : { name: '', color: '#6EE7B7', icon: tab === 'income' ? 'TrendingUp' : 'TrendingDown', type: tab, createdAt: new Date() });
    setShowModal(true);
    setError(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditSource(null);
    setError(null);
  };

  const handleSave = async () => {
    setError(null);
    if (!form.name) {
      setError('Source name is required.');
      return;
    }
    try {
      if (editSource) {
        await db.categories.update(editSource.id, {
          name: form.name,
          color: form.color,
          icon: form.icon,
          type: form.type,
        });
      } else {
        await db.categories.add({
          name: form.name,
          color: form.color,
          icon: form.icon,
          type: form.type,
          createdAt: new Date(),
        });
      }
      closeModal();
    } catch (e: any) {
      setError('Failed to save source: ' + (e?.message || e));
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    await db.categories.delete(id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--background)] to-[var(--background)] p-4 flex flex-col items-center animate-fade-in">
      <h1 className="text-3xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent drop-shadow-lg">Sources</h1>
      <div className="flex gap-4 mb-6">
        <button className={`btn ${tab === 'income' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('income')}>Income</button>
        <button className={`btn ${tab === 'expense' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('expense')}>Expense</button>
      </div>
      <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-6">
        {(sources || []).length === 0 && (
          <div className="clean-glass-card text-center text-[var(--text-secondary)] py-10 rounded-xl text-base font-medium">No sources yet. Add your first source below.</div>
        )}
        {(sources || []).filter(source => typeof source.id === 'number').map(source => (
          <div key={source.id} className="relative clean-glass-card p-6 rounded-2xl shadow-xl flex flex-col gap-2 transition-transform hover:scale-105 hover:shadow-2xl group">
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => openModal(source as SourceType)} className="p-2 rounded-full bg-white/70 hover:bg-[var(--primary)]/80 text-[var(--primary)] shadow-md"><Edit size={18} /></button>
              <button onClick={() => source.id !== undefined && handleDelete(source.id)} className="p-2 rounded-full bg-white/70 hover:bg-[var(--error)]/80 text-[var(--error)] shadow-md"><Trash2 size={18} /></button>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-4xl" style={{ color: source.color }}>
                {iconOptions.find(i => i.name === source.icon)?.icon}
              </span>
              <div>
                <div className="text-xl font-bold text-[var(--text-primary)] drop-shadow-sm">{source.name}</div>
              </div>
            </div>
          </div>
        ))}
        <button onClick={() => openModal()} className="clean-glass-card p-6 rounded-2xl shadow-xl flex flex-col items-center justify-center text-[var(--primary)] hover:scale-105 transition-transform">
          <Plus size={32} />
          <span className="mt-2 font-semibold">Add Source</span>
        </button>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fade-in">
          <div className="clean-glass-modal rounded-2xl p-8 shadow-2xl w-full max-w-md animate-slide-up border border-[var(--background)]/60">
            <h2 className="text-xl font-bold mb-4 text-[var(--text-primary)] text-center">{editSource ? 'Edit Source' : 'Add Source'}</h2>
            <div className="space-y-4">
              {error && <div className="text-[var(--error)] bg-[var(--error)]/10 rounded-lg p-2 text-center animate-fade-in-smooth">{error}</div>}
              <input type="text" placeholder="Source Name" className="input bg-white/80 text-[var(--text-primary)] placeholder-[var(--text-secondary)] font-medium" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <div className="flex gap-2 items-center">
                <span className="font-medium text-[var(--text-primary)]">Color:</span>
                <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="w-8 h-8 rounded-full border-none" />
              </div>
              <div className="flex gap-2 items-center flex-wrap">
                <span className="font-medium text-[var(--text-primary)]">Icon:</span>
                {iconOptions.map(opt => (
                  <button key={opt.name} className={`p-2 rounded-full border-2 ${form.icon === opt.name ? 'border-[var(--primary)]' : 'border-transparent'} bg-white/90 hover:bg-[var(--primary)]/10 transition-colors`} onClick={() => setForm({ ...form, icon: opt.name })}>{opt.icon}</button>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={closeModal} className="btn btn-outline flex-1">Cancel</button>
                <button onClick={handleSave} className="btn btn-primary flex-1 flex items-center justify-center gap-2">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <style>{`
        .clean-glass-card {
          background: rgba(255,255,255,0.85);
          box-shadow: 0 4px 24px 0 rgba(31, 38, 135, 0.07);
          backdrop-filter: blur(10px);
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.22);
          transition: box-shadow 0.18s, transform 0.18s, background 0.18s;
        }
        .clean-glass-modal {
          background: rgba(255,255,255,0.97);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.10);
          backdrop-filter: blur(18px);
          border-radius: 24px;
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

export default Sources; 