import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, Transaction, Category, Account } from '../db/db';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title } from 'chart.js';
import { TrendingUp, TrendingDown, ArrowDownUp, Download } from 'lucide-react';
import { exportAsCSV } from '../utils/exportUtils';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title);

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function getMonthYear(date: Date) {
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

// Luxury color palette for charts
const luxuryPalette = [
  '#a78bfa', // purple
  '#34d399', // green
  '#f87171', // red
  '#fbbf24', // yellow
  '#60a5fa', // blue
  '#f472b6', // pink
  '#38bdf8', // sky
  '#facc15', // gold
  '#4ade80', // emerald
  '#fb7185', // rose
  '#818cf8', // indigo
  '#f59e42', // orange
  '#10b981', // teal
  '#6366f1', // violet
  '#eab308', // amber
  '#0ea5e9', // cyan
  '#ef4444', // error
  '#14b8a6', // aqua
  '#8b5cf6', // deep purple
  '#ec4899', // magenta
];

const Analysis: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Data
  const transactions = useLiveQuery(
    async () => {
      const startDate = new Date(currentYear, currentMonth, 1);
      const endDate = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);
      return db.transactions.where('date').between(startDate, endDate).toArray();
    },
    [currentMonth, currentYear]
  ) || [];
  const allTransactions = useLiveQuery(() => db.transactions.toArray(), []) || [];
  const categories = useLiveQuery(() => db.categories.toArray(), []) || [];
  const accounts = useLiveQuery(() => db.accounts.toArray(), []) || [];

  // Summary
  const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const transfer = transactions.filter(t => t.type === 'transfer').reduce((sum, t) => sum + t.amount, 0);
  const balance = income - expense;

  // Category breakdowns
  function getCategoryBreakdown(type: 'income' | 'expense') {
    const cats = categories.filter(c => c.type === type);
    const data = cats.map(cat => {
      const total = transactions.filter(t => t.categoryId === cat.id).reduce((sum, t) => sum + t.amount, 0);
      return { ...cat, total };
    }).filter(c => c.total > 0);
    return data;
  }
  const incomeCats = getCategoryBreakdown('income');
  const expenseCats = getCategoryBreakdown('expense');

  // Assign unique colors to each category for the chart
  function getChartColors(cats: any[]) {
    return cats.map((c, i) => c.color || luxuryPalette[i % luxuryPalette.length]);
  }

  // Money flow (by day)
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const dailyFlow = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const date = new Date(currentYear, currentMonth, day);
    const dayIncome = transactions.filter(t => t.type === 'income' && new Date(t.date).getDate() === day).reduce((sum, t) => sum + t.amount, 0);
    const dayExpense = transactions.filter(t => t.type === 'expense' && new Date(t.date).getDate() === day).reduce((sum, t) => sum + t.amount, 0);
    return { day, dayIncome, dayExpense };
  });

  // Trends (last 6 months)
  const trendLabels = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(currentYear, currentMonth - 5 + i, 1);
    return `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
  });
  const trendData = trendLabels.map((label, idx) => {
    const d = new Date(currentYear, currentMonth - 5 + idx, 1);
    const dEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
    const monthTx = allTransactions.filter(t => t.date >= d && t.date <= dEnd);
    return {
      income: monthTx.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
      expense: monthTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
      transfer: monthTx.filter(t => t.type === 'transfer').reduce((sum, t) => sum + t.amount, 0),
    };
  });

  // Category color/icon helpers
  const iconMap = {
    TrendingUp, TrendingDown, ArrowDownUp
  };
  function getCategoryColor(catId?: number) {
    return categories.find(c => c.id === catId)?.color || '#a78bfa';
  }
  function getCategoryName(catId?: number) {
    return categories.find(c => c.id === catId)?.name || 'Unknown';
  }

  // Export
  const handleExport = () => {
    exportAsCSV(transactions, getCategoryName);
  };

  // Navigation
  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--background)] to-[var(--background)] p-4 animate-fade-in luxury-analysis-page">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent drop-shadow-lg">Analysis & Reports</h1>
            <div className="text-lg text-[var(--text-secondary)] font-medium mt-1">{monthNames[currentMonth]} {currentYear}</div>
          </div>
          <div className="flex gap-2 items-center mt-2 md:mt-0">
            <button onClick={goToPrevMonth} className="btn btn-outline">Prev</button>
            <button onClick={goToNextMonth} className="btn btn-outline">Next</button>
            <button onClick={handleExport} className="btn btn-secondary flex items-center gap-1"><Download className="w-5 h-5" /> Export CSV</button>
          </div>
        </div>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 luxury-summary-cards">
          <div className="lux-glass-card p-6 rounded-2xl shadow-xl flex flex-col items-center">
            <TrendingUp className="w-8 h-8 text-success mb-2" />
            <div className="text-xs text-[var(--text-secondary)]">Income</div>
            <div className="font-bold text-2xl text-success">₹{income.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
          <div className="lux-glass-card p-6 rounded-2xl shadow-xl flex flex-col items-center">
            <TrendingDown className="w-8 h-8 text-error mb-2" />
            <div className="text-xs text-[var(--text-secondary)]">Expense</div>
            <div className="font-bold text-2xl text-error">₹{expense.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
          <div className="lux-glass-card p-6 rounded-2xl shadow-xl flex flex-col items-center">
            <ArrowDownUp className="w-8 h-8 text-accent mb-2" />
            <div className="text-xs text-[var(--text-secondary)]">Transfer</div>
            <div className="font-bold text-2xl text-accent">₹{transfer.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
        </div>
        {/* Category Doughnut Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="lux-glass-card p-6 rounded-2xl shadow-xl">
            <div className="font-semibold text-lg mb-2 text-[var(--text-primary)]">Expense by Category</div>
            {expenseCats.length > 0 ? (
              <Doughnut
                data={{
                  labels: expenseCats.map(c => c.name),
                  datasets: [{
                    data: expenseCats.map(c => c.total),
                    backgroundColor: getChartColors(expenseCats),
                    borderWidth: 2,
                  }],
                }}
                options={{ plugins: { legend: { position: 'bottom' } }, animation: { animateRotate: true, duration: 900 } }}
              />
            ) : <div className="text-[var(--text-secondary)] text-center py-8">No expense data</div>}
          </div>
          <div className="lux-glass-card p-6 rounded-2xl shadow-xl">
            <div className="font-semibold text-lg mb-2 text-[var(--text-primary)]">Income by Category</div>
            {incomeCats.length > 0 ? (
              <Doughnut
                data={{
                  labels: incomeCats.map(c => c.name),
                  datasets: [{
                    data: incomeCats.map(c => c.total),
                    backgroundColor: getChartColors(incomeCats),
                    borderWidth: 2,
                  }],
                }}
                options={{ plugins: { legend: { position: 'bottom' } }, animation: { animateRotate: true, duration: 900 } }}
              />
            ) : <div className="text-[var(--text-secondary)] text-center py-8">No income data</div>}
          </div>
        </div>
        {/* Money Flow Bar Chart */}
        <div className="lux-glass-card p-6 rounded-2xl shadow-xl mb-10">
          <div className="font-semibold text-lg mb-2 text-[var(--text-primary)]">Money Flow (Daily)</div>
          <Bar
            data={{
              labels: dailyFlow.map(d => d.day),
              datasets: [
                {
                  label: 'Income',
                  data: dailyFlow.map(d => d.dayIncome),
                  backgroundColor: '#34d399',
                  borderRadius: 8,
                },
                {
                  label: 'Expense',
                  data: dailyFlow.map(d => d.dayExpense),
                  backgroundColor: '#f87171',
                  borderRadius: 8,
                },
              ],
            }}
            options={{
              plugins: { legend: { position: 'top' } },
              responsive: true,
              animation: { duration: 900 },
              scales: { x: { grid: { display: false } }, y: { grid: { color: '#e5e7eb' } } },
            }}
            height={120}
          />
        </div>
        {/* Trends Line Chart */}
        <div className="lux-glass-card p-6 rounded-2xl shadow-xl mb-10">
          <div className="font-semibold text-lg mb-2 text-[var(--text-primary)]">6-Month Trend</div>
          <Line
            data={{
              labels: trendLabels,
              datasets: [
                {
                  label: 'Income',
                  data: trendData.map(d => d.income),
                  borderColor: '#34d399',
                  backgroundColor: 'rgba(52,211,153,0.15)',
                  tension: 0.4,
                  fill: true,
                  pointRadius: 4,
                },
                {
                  label: 'Expense',
                  data: trendData.map(d => d.expense),
                  borderColor: '#f87171',
                  backgroundColor: 'rgba(248,113,113,0.15)',
                  tension: 0.4,
                  fill: true,
                  pointRadius: 4,
                },
                {
                  label: 'Transfer',
                  data: trendData.map(d => d.transfer),
                  borderColor: '#a78bfa',
                  backgroundColor: 'rgba(167,139,250,0.10)',
                  tension: 0.4,
                  fill: true,
                  pointRadius: 4,
                },
              ],
            }}
            options={{
              plugins: { legend: { position: 'top' } },
              responsive: true,
              animation: { duration: 900 },
              scales: { x: { grid: { display: false } }, y: { grid: { color: '#e5e7eb' } } },
            }}
            height={120}
          />
        </div>
      </div>
      <style>{`
        .luxury-analysis-page {
          background: linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(240,240,255,0.98) 100%);
        }
        [data-theme='dark'] .luxury-analysis-page {
          background: linear-gradient(135deg, rgba(30,32,40,0.98) 0%, rgba(40,44,60,0.98) 100%);
        }
        .lux-glass-card {
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

export default Analysis; 