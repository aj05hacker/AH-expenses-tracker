import React, { useState } from 'react';
import { Plus, Edit, Trash2, CreditCard, Wallet as WalletIcon, Check } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, Account as DBAccount } from '../db/db';

const icons = [WalletIcon, CreditCard];
const iconNames = ['Wallet', 'CreditCard'];

type AccountType = DBAccount & { id: number };

const Wallets: React.FC = () => {
  const accounts = useLiveQuery(() => db.accounts.toArray(), []);
  const [showModal, setShowModal] = useState(false);
  const [editAccount, setEditAccount] = useState<null | AccountType>(null);
  const [form, setForm] = useState<{ name: string; icon: string; color: string; balance: string }>({ name: '', icon: 'Wallet', color: '#43E97B', balance: '' });
  const [error, setError] = useState<string | null>(null);

  const openModal = (account: AccountType | null = null) => {
    setEditAccount(account);
    setForm(account ? { name: account.name, icon: account.icon || 'Wallet', color: account.color || '#43E97B', balance: account.balance.toString() } : { name: '', icon: 'Wallet', color: '#43E97B', balance: '' });
    setError(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditAccount(null);
    setError(null);
  };

  const handleSave = async () => {
    setError(null);
    if (!form.name) {
      setError('Account name is required.');
      return;
    }
    if (!form.balance || isNaN(Number(form.balance))) {
      setError('Balance must be a valid number.');
      return;
    }
    try {
      if (editAccount) {
        await db.accounts.update(editAccount.id, {
          name: form.name,
          icon: form.icon,
          color: form.color,
          balance: parseFloat(form.balance),
        });
      } else {
        await db.accounts.add({
          name: form.name,
          icon: form.icon,
          color: form.color,
          balance: parseFloat(form.balance),
          createdAt: new Date(),
        });
      }
      closeModal();
    } catch (e: any) {
      setError('Failed to save account: ' + (e?.message || e));
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    await db.accounts.delete(id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--background)] to-[var(--background)] p-4">
      <div className="max-w-lg mx-auto flex flex-col gap-0">
        <div className="clean-glass-card w-full mx-auto mt-8 mb-8 p-6 rounded-2xl shadow-md flex flex-col items-center">
          <div className="text-lg font-semibold tracking-wide text-[var(--text-primary)] mb-2">Wallet Overview</div>
          <div className="flex w-full justify-between gap-2 mt-2">
            <div className="flex-1 flex flex-col items-center">
              <span className="text-xs text-[var(--text-secondary)] mb-1">Expense</span>
              <span className="font-bold text-lg text-[var(--error)]">₹{(accounts||[]).filter(a=>a.balance<0).reduce((sum,acc)=>sum+(acc.balance||0),0).toFixed(2)}</span>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <span className="text-xs text-[var(--text-secondary)] mb-1">Total</span>
              <span className="font-bold text-lg text-[var(--primary)]">₹{(accounts||[]).reduce((sum,acc)=>sum+(acc.balance||0),0).toFixed(2)}</span>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <span className="text-xs text-[var(--text-secondary)] mb-1">Income</span>
              <span className="font-bold text-lg text-[var(--success)]">₹{(accounts||[]).filter(a=>a.balance>0).reduce((sum,acc)=>sum+(acc.balance||0),0).toFixed(2)}</span>
            </div>
          </div>
        </div>
        <div className="w-full flex flex-col gap-5 px-1">
          {(accounts || []).length === 0 && (
            <div className="clean-glass-card text-center text-[var(--text-secondary)] py-10 rounded-xl text-base font-medium">No wallets yet. Add your first wallet below.</div>
          )}
          {(accounts || []).map(account => {
            if (typeof account.id !== 'number') return null;
            const Icon = icons[iconNames.indexOf(account.icon || 'Wallet')] || WalletIcon;
            return (
              <div key={account.id} className="clean-glass-card flex items-center gap-4 p-5 rounded-2xl shadow-sm border border-white/40 relative transition-all duration-200 hover:shadow-md group">
                <span className="text-3xl bg-white/80 rounded-xl p-2 shadow-sm" style={{ color: account.color }}><Icon /></span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-base text-[var(--text-primary)] truncate">{account.name}</div>
                  <div className={`font-semibold text-sm ${account.balance < 0 ? 'text-[var(--error)]' : 'text-[var(--success)]'}`}>Balance: ₹{account.balance.toFixed(2)}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openModal(account as AccountType)} className="p-2 rounded-full bg-white/80 hover:bg-[var(--primary)/10] text-[var(--primary)] shadow transition-colors focus:ring-2 focus:ring-[var(--primary)] focus:outline-none"><Edit size={18} /></button>
                  <button onClick={() => account.id !== undefined && handleDelete(account.id)} className="p-2 rounded-full bg-white/80 hover:bg-[var(--error)/10] text-[var(--error)] shadow transition-colors focus:ring-2 focus:ring-[var(--error)] focus:outline-none"><Trash2 size={18} /></button>
                </div>
              </div>
            );
          })}
        </div>
        <button
          onClick={() => openModal(null)}
          className="w-full mt-8 py-3 rounded-2xl clean-glass-card shadow-md flex items-center justify-center gap-3 text-base font-semibold text-[var(--text-primary)] hover:bg-[var(--background)] hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          style={{letterSpacing: '0.02em'}}>
          Add Wallet
        </button>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] animate-fade-in-smooth">
          <div className="clean-glass-modal rounded-2xl p-8 shadow-2xl w-full max-w-md animate-fade-in-smooth border border-[var(--background)]/60">
            <h2 className="text-xl font-bold mb-6 text-[var(--text-primary)] text-center">{editAccount ? 'Edit Wallet' : 'Add Wallet'}</h2>
            <div className="space-y-5">
              {error && <div className="text-[var(--error)] bg-[var(--error)]/10 rounded-lg p-2 text-center animate-fade-in-smooth">{error}</div>}
              <input type="text" placeholder="Wallet Name" className="input bg-white/80 text-[var(--text-primary)] placeholder-[var(--text-secondary)] font-medium" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <input type="number" placeholder="Balance" className="input bg-white/80 text-[var(--text-primary)] placeholder-[var(--text-secondary)] font-medium" value={form.balance} onChange={e => setForm({ ...form, balance: e.target.value })} />
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

export default Wallets; 