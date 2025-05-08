import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, Transaction, Category, Account as DBAccount } from '../db/db';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Plus, Calendar, TrendingDown, TrendingUp, DollarSign, Wallet, CreditCard, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const icons = [Wallet, CreditCard];
const iconNames = ['Wallet', 'CreditCard'];
type AccountType = DBAccount & { id: number };

const Dashboard: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  // Get transactions for the current month
  const transactions = useLiveQuery(
    async () => {
      const startDate = new Date(currentYear, currentMonth, 1);
      const endDate = new Date(currentYear, currentMonth + 1, 0);
      
      return db.transactions
        .where('date')
        .between(startDate, endDate)
        .toArray();
    },
    [currentMonth, currentYear]
  );
  
  // Get all categories
  const categories = useLiveQuery(() => db.categories.toArray());
  
  // Calculate summary
  const summary = {
    income: transactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) || 0,
    expenses: transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) || 0,
    balance: 0
  };
  
  summary.balance = summary.income - summary.expenses;
  
  // Process data for charts
  const expensesByCategory = transactions && categories 
    ? processTransactionsByCategory(transactions, categories, 'expense')
    : [];
    
  const incomeByCategory = transactions && categories 
    ? processTransactionsByCategory(transactions, categories, 'income')
    : [];

  // Previous month
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  
  // Next month
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const accounts = useLiveQuery(() => db.accounts.toArray(), []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0e7ff] via-[#f0fdfa] to-[#f3e8ff] p-4 flex flex-col items-center animate-fade-in">
      <h1 className="text-3xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent drop-shadow-lg">Welcome to AH Expenses Tracker</h1>
      <p className="mb-8 text-lg text-text-secondary">Your luxury daily finance companion</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl">
        <Link to="/wallets" className="focus:outline-none">
          <div className="glassy-card p-6 rounded-2xl shadow-xl flex items-center gap-4 animate-slide-up transition-transform hover:scale-105 hover:shadow-2xl cursor-pointer">
            <span className="text-4xl text-primary"><Wallet /></span>
            <div>
              <div className="text-lg font-bold text-text-primary">Wallets</div>
              <div className="text-text-secondary">Manage your wallets</div>
            </div>
          </div>
        </Link>
        <Link to="/cards" className="focus:outline-none">
          <div className="glassy-card p-6 rounded-2xl shadow-xl flex items-center gap-4 animate-slide-up transition-transform hover:scale-105 hover:shadow-2xl cursor-pointer">
            <span className="text-4xl text-accent"><CreditCard /></span>
            <div>
              <div className="text-lg font-bold text-text-primary">Cards</div>
              <div className="text-text-secondary">Manage your cards</div>
            </div>
          </div>
        </Link>
        <Link to="/sources" className="focus:outline-none">
          <div className="glassy-card p-6 rounded-2xl shadow-xl flex items-center gap-4 animate-slide-up transition-transform hover:scale-105 hover:shadow-2xl cursor-pointer">
            <span className="text-4xl text-success"><TrendingUp /></span>
            <div>
              <div className="text-lg font-bold text-text-primary">Income</div>
              <div className="text-text-secondary">Track your income sources</div>
            </div>
          </div>
        </Link>
        <Link to="/sources" className="focus:outline-none">
          <div className="glassy-card p-6 rounded-2xl shadow-xl flex items-center gap-4 animate-slide-up transition-transform hover:scale-105 hover:shadow-2xl cursor-pointer">
            <span className="text-4xl text-error"><TrendingDown /></span>
            <div>
              <div className="text-lg font-bold text-text-primary">Expenses</div>
              <div className="text-text-secondary">Track your expenses</div>
            </div>
          </div>
        </Link>
      </div>
      <div className="max-w-lg mx-auto flex flex-col gap-0 mt-8">
        <div className="clean-glass-card w-full mx-auto mb-8 p-6 rounded-2xl shadow-md flex flex-col items-center">
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
            <div className="clean-glass-card text-center text-[var(--text-secondary)] py-10 rounded-xl text-base font-medium">No wallets yet. Add your first wallet in the Wallets page.</div>
          )}
          {(accounts || []).map(account => {
            if (typeof account.id !== 'number') return null;
            const Icon = icons[iconNames.indexOf(account.icon || 'Wallet')] || Wallet;
            return (
              <div key={account.id} className="clean-glass-card flex items-center gap-4 p-5 rounded-2xl shadow-sm border border-white/40 relative transition-all duration-200 hover:shadow-md group">
                <span className="text-3xl bg-white/80 rounded-xl p-2 shadow-sm" style={{ color: account.color }}><Icon /></span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-base text-[var(--text-primary)] truncate">{account.name}</div>
                  <div className={`font-semibold text-sm ${account.balance < 0 ? 'text-[var(--error)]' : 'text-[var(--success)]'}`}>Balance: ₹{account.balance.toFixed(2)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`
        .glassy-card {
          background: rgba(255,255,255,0.7);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
          backdrop-filter: blur(12px);
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.18);
        }
      `}</style>
    </div>
  );
};

interface SummaryCardProps {
  title: string;
  amount: number;
  icon: React.ReactNode;
  color: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, amount, icon, color }) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-background p-2 rounded-full">
            {icon}
          </div>
          <h3 className="font-medium">{title}</h3>
        </div>
        <p className={`text-xl font-bold ${color}`}>
          ${amount.toFixed(2)}
        </p>
      </div>
    </div>
  );
};

// Helper function to process transactions by category
function processTransactionsByCategory(
  transactions: Transaction[], 
  categories: Category[], 
  type: 'income' | 'expense'
) {
  const filtered = transactions.filter(t => t.type === type);
  const categoryMap = new Map();
  
  // Initialize all categories with 0 amount
  categories
    .filter(c => c.type === type)
    .forEach(c => {
      categoryMap.set(c.id, {
        id: c.id,
        name: c.name,
        color: c.color,
        amount: 0
      });
    });
  
  // Sum transactions by category
  filtered.forEach(transaction => {
    const category = categoryMap.get(transaction.categoryId);
    if (category) {
      category.amount += transaction.amount;
    }
  });
  
  // Convert map to array and filter out zero amounts
  return Array.from(categoryMap.values())
    .filter(c => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);
}

export default Dashboard;