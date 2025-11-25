'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { CoachRickDrawer } from './coach-rick-drawer';
import Image from 'next/image';

interface BarrelsHeaderProps {
  activeTab?: 'dashboard' | 'new-lesson' | 'history';
}

export default function BarrelsHeader({ activeTab }: BarrelsHeaderProps) {
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
      {/* Simplified Top Bar - Icon and Menu Only */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-gradient-to-r from-barrels-black-light to-barrels-black border-b border-barrels-black-lighter sticky top-0 z-20"
      >
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left Side - Small Icon Only (subtle) */}
            <div className="relative w-8 h-8 flex-shrink-0 opacity-60">
              <Image
                src="/barrels-icon.png"
                alt="BARRELS"
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Right Side - Menu Icon */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 rounded-lg bg-barrels-black-light hover:bg-barrels-black-lighter border border-barrels-black-lighter hover:border-barrels-blue transition-all duration-200"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6 text-barrels-neutral" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* BARRELS Logo Header - Full transparent logo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="bg-barrels-black border-b border-barrels-black-lighter sticky top-[60px] z-15"
      >
        <div className="max-w-4xl mx-auto px-4 flex items-center h-24">
          {/* Left-aligned transparent logo */}
          <div className="relative h-14 w-auto">
            <Image
              src="/barrels-logo-transparent.png"
              alt="BARRELS"
              height={56}
              width={300}
              className="object-contain object-left"
              priority
            />
          </div>
        </div>
      </motion.div>

      {/* Three-Tab Navigation Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-barrels-black border-b border-barrels-black-lighter sticky top-[156px] z-10"
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
                    ${
                      isActive
                        ? 'bg-gradient-to-r from-barrels-gold to-barrels-gold-light text-barrels-black border-2 border-barrels-gold-dark shadow-lg shadow-barrels-gold/30'
                        : 'bg-barrels-black-light text-barrels-neutral-gray border border-barrels-black-lighter hover:bg-barrels-black-lighter hover:text-barrels-neutral hover:border-barrels-blue'
                    }
                  `}
                >
                  {/* Active tab indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-lg bg-gradient-to-r from-barrels-gold to-barrels-gold-light opacity-20"
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
