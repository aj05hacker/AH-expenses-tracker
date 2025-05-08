import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { db } from './db/db';
import { ThemeProvider } from './context/ThemeContext';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Categories from './pages/Categories';
import Settings from './pages/Settings';
import AddTransaction from './pages/AddTransaction';
import Layout from './components/Layout';
import Wallets from './pages/Wallets';
import Cards from './pages/Cards';
import Sources from './pages/Sources';
import Records from './pages/Records';
import Analysis from './pages/Analysis';
import Budget from './pages/Budget';
import Accounts from './pages/Accounts';
import InstallPrompt from './components/InstallPrompt';

function App() {
  // Initialize the database
  useEffect(() => {
    const initDb = async () => {
      try {
        await db.initializeDefaultCategories();
      } catch (error) {
        console.error("Failed to initialize database:", error);
      }
    };
    
    initDb();
  }, []);

  return (
    <ThemeProvider>
      <Router>
        <InstallPrompt />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Records />} />
            <Route path="records" element={<Records />} />
            <Route path="analysis" element={<Analysis />} />
            <Route path="budget" element={<Budget />} />
            <Route path="accounts" element={<Accounts />} />
            <Route path="categories" element={<Categories />} />
            <Route path="settings" element={<Settings />} />
            <Route path="add" element={<AddTransaction />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;