import { Suspense } from 'react';
import { SupportTicketsClient } from './support-tickets-client';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Support Tickets - CatchBarrels Admin',
  description: 'Manage bug reports and support requests from athletes',
};

export default function SupportTicketsPage() {
  return (
    <div className="min-h-screen bg-[#1a2332] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            📮 Support Tickets
          </h1>
          <p className="text-gray-400">
            Bug reports and help requests from athletes
          </p>
        </div>

        {/* Tickets Table */}
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-barrels-gold animate-spin" />
            </div>
          }
        >
          <SupportTicketsClient />
        </Suspense>
      </div>
    </div>
  );
}
