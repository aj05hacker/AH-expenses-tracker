import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShow(false);
      }
      setDeferredPrompt(null);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center pointer-events-none">
      <div className="mb-8 pointer-events-auto animate-fade-in-up">
        <div className="glassy-card p-6 rounded-2xl shadow-2xl flex items-center gap-4 max-w-xs mx-auto relative border border-primary/20">
          <button onClick={() => setShow(false)} className="absolute top-2 right-2 p-1 rounded-full bg-white/60 hover:bg-error/80 text-error transition-colors"><X size={20} /></button>
          <span className="bg-primary/90 text-white rounded-full p-3 shadow-lg animate-bounce"><Download size={28} /></span>
          <div className="flex-1">
            <div className="font-bold text-lg text-primary mb-1">Install AH Expenses Tracker</div>
            <div className="text-sm text-text-secondary mb-2">Add this luxury app to your home screen for the best experience.</div>
            <button onClick={handleInstall} className="btn btn-primary w-full flex items-center justify-center gap-2 mt-2 animate-pulse">
              <Download size={18} /> Install
            </button>
          </div>
        </div>
      </div>
      <style>{`
        .glassy-card {
          background: rgba(255,255,255,0.8);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
          backdrop-filter: blur(16px);
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.18);
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default InstallPrompt; 