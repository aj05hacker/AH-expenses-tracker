import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Download } from 'lucide-react';

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Update UI to notify the user they can add to home screen
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);

    // Act on the user's choice
    if (outcome === 'accepted') {
      toast.success('Thank you for installing AH Expenses!');
      setShowInstallButton(false);
    } else {
      toast.info('You can install AH Expenses later from your browser menu');
    }
  };

  if (!showInstallButton) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={handleInstallClick}
        className="bg-primary hover:bg-primary/90 text-white rounded-full px-4 py-2 shadow-lg transition-all duration-200 hover:scale-105 flex items-center gap-2"
      >
        <Download className="w-5 h-5" />
        <span>Install App</span>
      </button>
    </div>
  );
};

export default InstallPrompt; 