import React, { useState } from 'react';
import { Plus, Edit, Trash2, CreditCard, Wallet, Check } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, Card as DBCard } from '../db/db';

const iconOptions = [
  { name: 'CreditCard', icon: <CreditCard /> },
  { name: 'Wallet', icon: <Wallet /> },
];

type CardType = DBCard & { id: number };

const Cards: React.FC = () => {
  const cards = useLiveQuery(() => db.cards.toArray(), []);
  const [showModal, setShowModal] = useState(false);
  const [editCard, setEditCard] = useState<CardType | null>(null);
  const [form, setForm] = useState<Omit<CardType, 'id'>>({ name: '', number: '', color: '#FDE68A', icon: 'CreditCard', createdAt: new Date() });
  const [error, setError] = useState<string | null>(null);

  const openModal = (card: CardType | null = null) => {
    setEditCard(card);
    setForm(card ? { name: card.name, number: card.number, color: card.color, icon: card.icon, createdAt: card.createdAt } : { name: '', number: '', color: '#FDE68A', icon: 'CreditCard', createdAt: new Date() });
    setShowModal(true);
    setError(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditCard(null);
    setError(null);
  };

  const handleSave = async () => {
    setError(null);
    if (!form.name) {
      setError('Card name is required.');
      return;
    }
    if (!form.number) {
      setError('Card number is required.');
      return;
    }
    try {
      if (editCard) {
        await db.cards.update(editCard.id, {
          name: form.name,
          number: form.number,
          color: form.color,
          icon: form.icon,
        });
      } else {
        await db.cards.add({
          name: form.name,
          number: form.number,
          color: form.color,
          icon: form.icon,
          createdAt: new Date(),
        });
      }
      closeModal();
    } catch (e: any) {
      setError('Failed to save card: ' + (e?.message || e));
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    await db.cards.delete(id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--background)] to-[var(--background)] p-4 flex flex-col items-center animate-fade-in">
      <h1 className="text-3xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-accent to-primary drop-shadow-lg">Cards</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
        {(cards || []).filter(card => typeof card.id === 'number').map(card => (
          <div key={card.id} className="relative clean-glass-card p-6 rounded-2xl shadow-xl flex flex-col gap-2 transition-transform hover:scale-105 hover:shadow-2xl group">
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => openModal(card as CardType)} className="p-2 rounded-full bg-white/70 hover:bg-[var(--primary)]/80 text-[var(--primary)] shadow-md"><Edit size={18} /></button>
              <button onClick={() => card.id !== undefined && handleDelete(card.id)} className="p-2 rounded-full bg-white/70 hover:bg-[var(--error)]/80 text-[var(--error)] shadow-md"><Trash2 size={18} /></button>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-4xl" style={{ color: card.color }}>
                {iconOptions.find(i => i.name === card.icon)?.icon}
              </span>
              <div>
                <div className="text-xl font-bold text-[var(--text-primary)] drop-shadow-sm">{card.name}</div>
                <div className="text-lg text-[var(--text-secondary)]">{card.number}</div>
              </div>
            </div>
          </div>
        ))}
        <button onClick={() => openModal()} className="clean-glass-card p-6 rounded-2xl shadow-xl flex flex-col items-center justify-center text-[var(--primary)] hover:scale-105 transition-transform">
          <Plus size={32} />
          <span className="mt-2 font-semibold">Add Card</span>
        </button>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fade-in">
          <div className="clean-glass-modal rounded-2xl p-8 shadow-2xl w-full max-w-md animate-slide-up border border-[var(--background)]/60">
            <h2 className="text-xl font-bold mb-4 text-[var(--text-primary)] text-center">{editCard ? 'Edit Card' : 'Add Card'}</h2>
            <div className="space-y-4">
              {error && <div className="text-[var(--error)] bg-[var(--error)]/10 rounded-lg p-2 text-center animate-fade-in-smooth">{error}</div>}
              <input type="text" placeholder="Card Name" className="input bg-white/80 text-[var(--text-primary)] placeholder-[var(--text-secondary)] font-medium" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <input type="text" placeholder="Card Number (e.g. **** 1234)" className="input bg-white/80 text-[var(--text-primary)] placeholder-[var(--text-secondary)] font-medium" value={form.number} onChange={e => setForm({ ...form, number: e.target.value })} />
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

export default Cards; 