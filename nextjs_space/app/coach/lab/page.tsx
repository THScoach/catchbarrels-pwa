// app/coach/lab/page.tsx
'use client';
import { CoachLayout } from '@/components/coach/coach-layout';

export default function CoachLabPage() {
  return (
    <CoachLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-barrels-gold">Coach Rick AI Lab</h1>
        <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-barrels-gold/20 rounded-2xl p-6">
          <p className="text-slate-400">
            TODO: AI query interface with filters, question box, and chart results.
          </p>
        </div>
      </div>
    </CoachLayout>
  );
}
