import React from 'react';

const Navbar: React.FC = () => {
  return (
    <header className="w-full py-4 px-6 bg-white/70 backdrop-blur-xl shadow-lg flex items-center justify-center animate-fade-in">
      <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent drop-shadow-lg">
        AH Expenses Tracker
      </h1>
    </header>
  );
};

export default Navbar;