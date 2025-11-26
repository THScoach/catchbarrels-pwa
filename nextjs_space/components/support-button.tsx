'use client';

import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { SupportPanel } from './support-panel';

export function SupportButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Support Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-barrels-gold hover:bg-barrels-gold-light text-black font-medium rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 group"
        aria-label="Need help?"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="text-sm font-semibold">Need help?</span>
      </button>

      {/* Support Panel */}
      <SupportPanel open={open} onOpenChange={setOpen} />
    </>
  );
}
