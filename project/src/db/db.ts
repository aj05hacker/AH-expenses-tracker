import Dexie, { Table } from 'dexie';

// Define types for our database tables
export interface Category {
  id?: number;
  name: string;
  type: 'income' | 'expense';
  color?: string;
  icon?: string;
  createdAt: Date;
}

export interface Transaction {
  id?: number;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  categoryId?: number;
  accountId?: number;
  toAccountId?: number;
  date: Date;
  notes?: string;
  createdAt: Date;
}

export interface Account {
  id?: number;
  name: string;
  icon?: string;
  color?: string;
  balance: number;
  createdAt: Date;
}

export interface Card {
  id?: number;
  name: string;
  number: string;
  color?: string;
  icon?: string;
  createdAt: Date;
}

export interface Budget {
  id?: number;
  categoryId: number;
  month: number; // 0-11
  year: number;
  amount: number;
  createdAt: Date;
}

// Define the database
class ExpensesDB extends Dexie {
  categories!: Table<Category, number>;
  transactions!: Table<Transaction, number>;
  accounts!: Table<Account, number>;
  cards!: Table<Card, number>;
  budgets!: Table<Budget, number>;

  constructor() {
    super('ExpensesTrackerDB');
    
    // Define tables and indexes
    this.version(4).stores({
      categories: '++id, name, type',
      transactions: '++id, type, categoryId, accountId, date',
      accounts: '++id, name',
      cards: '++id, name, number',
      budgets: '++id, categoryId, month, year',
    });
  }

  // Initialize default categories
  async initializeDefaultCategories() {
    const count = await this.categories.count();
    if (count === 0) {
      // Default income categories
      await this.categories.bulkAdd([
        { name: 'Salary', type: 'income', color: '#10b981', icon: 'briefcase', createdAt: new Date() },
        { name: 'Freelance', type: 'income', color: '#8b5cf6', icon: 'laptop', createdAt: new Date() },
        { name: 'Investments', type: 'income', color: '#0ea5e9', icon: 'trending-up', createdAt: new Date() },
      ]);

      // Default expense categories
      await this.categories.bulkAdd([
        { name: 'Food', type: 'expense', color: '#f59e0b', icon: 'utensils', createdAt: new Date() },
        { name: 'Housing', type: 'expense', color: '#6366f1', icon: 'home', createdAt: new Date() },
        { name: 'Transportation', type: 'expense', color: '#ef4444', icon: 'car', createdAt: new Date() },
        { name: 'Entertainment', type: 'expense', color: '#ec4899', icon: 'film', createdAt: new Date() },
        { name: 'Utilities', type: 'expense', color: '#14b8a6', icon: 'zap', createdAt: new Date() },
      ]);
    }
  }
}

export const db = new ExpensesDB();