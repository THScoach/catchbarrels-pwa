
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Video, BookOpen, Users, User } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Home' },
    { href: '/video', icon: Video, label: 'Video' },
    { href: '/library', icon: BookOpen, label: 'Library' },
    { href: '/coaching', icon: Users, label: 'Coaching' },
    { href: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1a2332] border-t border-gray-800 z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-colors ${
                isActive
                  ? 'text-[#2196F3]'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
