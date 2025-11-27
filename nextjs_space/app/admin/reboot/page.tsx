/**
 * Reboot Motion Data Admin Page
 * 
 * Server component that fetches Reboot session data and passes it to the client.
 * This page is admin/coach-only and protected by /admin layout.
 */

import { Metadata } from 'next';
import { prisma } from '@/lib/db';
import RebootClient from './reboot-client';
import { REBOOT_SYNC_ENABLED } from '@/lib/config/reboot-flags';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Reboot Motion Data | Coach Control Room',
  description: 'View and sync swing data from Reboot Motion',
};

export default async function RebootPage() {
  // Feature flag guard
  if (!REBOOT_SYNC_ENABLED) {
    redirect('/admin');
  }

  // Fetch all Reboot sessions from database
  const sessions = await prisma.rebootSession.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200, // Limit to most recent 200 for performance
  });

  // Get summary stats
  const totalCount = await prisma.rebootSession.count();
  const mlbCount = await prisma.rebootSession.count({ where: { level: 'MLB' } });
  const proCount = await prisma.rebootSession.count({ where: { level: 'Pro' } });
  const collegeCount = await prisma.rebootSession.count({ where: { level: 'College' } });
  const hsCount = await prisma.rebootSession.count({ where: { level: 'HS' } });
  const youthCount = await prisma.rebootSession.count({ where: { level: 'Youth' } });

  const stats = {
    total: totalCount,
    mlb: mlbCount,
    pro: proCount,
    college: collegeCount,
    hs: hsCount,
    youth: youthCount,
  };

  return <RebootClient sessions={sessions} stats={stats} />;
}
