'use client';

import { useState } from 'react';
import { BottomNav } from '@/components/bottom-nav';
import { Target, Search } from 'lucide-react';
import Link from 'next/link';

export function DrillsClient({ drills }: any) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const categories = ['All', 'Anchor', 'Engine', 'Whip', 'Tempo', 'General'];

  const filteredDrills = drills?.filter((drill: any) => {
    const matchesSearch = drill?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase() || '');
    const matchesCategory = categoryFilter === 'All' || drill?.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#1a2332] pb-20">
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Drill Library</h1>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search drills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2196F3]"
          />
        </div>

        {/* Category Filter */}
        <div className="flex overflow-x-auto space-x-2 mb-6 pb-2 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setCategoryFilter(category)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                categoryFilter === category
                  ? 'bg-[#2196F3] text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Drills Grid */}
        <div className="grid gap-4">
          {filteredDrills?.map((drill: any) => (
            <Link
              key={drill?.id}
              href={`/drills/${drill?.id}`}
              className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:bg-gray-800/70 transition-colors"
            >
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#2196F3] to-[#1976D2] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium mb-1">{drill?.name}</h3>
                  <p className="text-gray-400 text-sm mb-2 line-clamp-2">{drill?.primaryPurpose}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-[#2196F3]/20 text-[#2196F3] text-xs rounded">
                      {drill?.category}
                    </span>
                    <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                      {drill?.difficulty}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredDrills?.length === 0 && (
          <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-12 text-center">
            <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No drills found</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
