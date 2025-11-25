'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { CoachRickDrawer } from './coach-rick-drawer';

interface GoatyHeaderProps {
  activeTab?: 'dashboard' | 'new-lesson' | 'history';
}

export default function GoatyHeader({ activeTab }: GoatyHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession() || {};
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Determine active tab from pathname if not provided
  const currentTab = activeTab || 
    (pathname?.startsWith('/lesson/new') ? 'new-lesson' :
     pathname?.startsWith('/lesson/history') ? 'history' :
     'dashboard');

  const firstName = session?.user?.name?.split(' ')[0] || 'Athlete';

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', route: '/dashboard' },
    { id: 'new-lesson', label: 'New Lesson', route: '/lesson/new' },
    { id: 'history', label: 'History', route: '/lesson/history' },
  ];

  const handleTabClick = (route: string) => {
    router.push(route);
  };

  return (
    <>
      {/* GOATY Header Card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-gradient-to-r from-[#1a2332] to-[#0f1621] border-b border-[#2a3f5f] sticky top-0 z-20"
      >
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left Side - GOAT Icon + Title + Subtitle */}
            <div className="flex items-center space-x-3">
              {/* GOAT Mascot Icon */}
              <div className="text-5xl" role="img" aria-label="GOAT mascot">
                🐐
              </div>
              
              {/* Title and Subtitle */}
              <div className="flex flex-col">
                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                  Train with GOATY
                </h1>
                <p className="text-sm md:text-base text-gray-400">
                  Let's unleash your inner GOAT, {firstName}!
                </p>
              </div>
            </div>

            {/* Right Side - Menu Icon */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 rounded-lg bg-[#1a2332] hover:bg-[#2a3f5f] border border-[#2a3f5f] hover:border-[#3a5f7f] transition-all duration-200"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6 text-gray-300" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Three-Tab Navigation Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-[#0f1621] border-b border-[#2a3f5f] sticky top-[88px] md:top-[96px] z-10"
      >
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="grid grid-cols-3 gap-2">
            {tabs.map((tab) => {
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.route)}
                  className={`
                    relative px-4 py-3 rounded-lg font-semibold text-sm md:text-base
                    transition-all duration-300 ease-in-out
                    ${isActive
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-2 border-orange-400 shadow-lg shadow-orange-500/30'
                      : 'bg-[#1a2332] text-gray-400 border border-[#2a3f5f] hover:bg-[#2a3f5f] hover:text-gray-200 hover:border-[#3a5f7f]'
                    }
                  `}
                >
                  {/* Active tab indicator line */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 opacity-20"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Coach Rick Drawer */}
      <CoachRickDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
}
