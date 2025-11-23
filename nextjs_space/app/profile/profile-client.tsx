'use client';

import { signOut } from 'next-auth/react';
import { BottomNav } from '@/components/bottom-nav';
import { User, LogOut } from 'lucide-react';

export function ProfileClient({ user }: any) {
  return (
    <div className="min-h-screen bg-[#1a2332] pb-20">
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Profile</h1>

        <div className="space-y-4">
          {/* Basic Info */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-[#2196F3] rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{user?.name}</h2>
                <p className="text-gray-400">{user?.username}</p>
              </div>
            </div>
          </div>

          {/* Physical Stats */}
          {(user?.height || user?.weight) && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-4">Physical Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                {user?.height && (
                  <div>
                    <p className="text-gray-400 text-sm">Height</p>
                    <p className="text-white">{Math.floor(user.height / 12)}'{user.height % 12}"</p>
                  </div>
                )}
                {user?.weight && (
                  <div>
                    <p className="text-gray-400 text-sm">Weight</p>
                    <p className="text-white">{user.weight} lbs</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Playing Profile */}
          {(user?.bats || user?.throws || user?.position || user?.level) && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-4">Playing Profile</h3>
              <div className="grid grid-cols-2 gap-4">
                {user?.bats && (
                  <div>
                    <p className="text-gray-400 text-sm">Bats</p>
                    <p className="text-white">{user.bats}</p>
                  </div>
                )}
                {user?.throws && (
                  <div>
                    <p className="text-gray-400 text-sm">Throws</p>
                    <p className="text-white">{user.throws}</p>
                  </div>
                )}
                {user?.position && (
                  <div>
                    <p className="text-gray-400 text-sm">Position</p>
                    <p className="text-white">{user.position}</p>
                  </div>
                )}
                {user?.level && (
                  <div>
                    <p className="text-gray-400 text-sm">Level</p>
                    <p className="text-white">{user.level}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Equipment */}
          {(user?.batLength || user?.batWeight || user?.batType) && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-4">Equipment</h3>
              <div className="grid grid-cols-2 gap-4">
                {user?.batLength && (
                  <div>
                    <p className="text-gray-400 text-sm">Bat Length</p>
                    <p className="text-white">{user.batLength}"</p>
                  </div>
                )}
                {user?.batWeight && (
                  <div>
                    <p className="text-gray-400 text-sm">Bat Weight</p>
                    <p className="text-white">{user.batWeight} oz</p>
                  </div>
                )}
                {user?.batType && (
                  <div>
                    <p className="text-gray-400 text-sm">Bat Type</p>
                    <p className="text-white">{user.batType}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sign Out Button */}
          <button
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
            className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/50 py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
