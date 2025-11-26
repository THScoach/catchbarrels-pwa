import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { redirect } from 'next/navigation';
import { getAdminDashboardData } from '@/lib/admin/getAdminDashboardData';
import AdminDashboardClient from './admin-dashboard-client';

export const metadata = {
  title: 'Coach Control Room - CatchBarrels Admin',
  description: 'Deep view of your roster, sessions, and momentum transfer patterns',
};

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login?callbackUrl=/admin');
  }

  // Check for admin or coach role
  const userRole = (session.user as any)?.role || 'player';
  const hasAdminAccess = userRole === 'admin' || userRole === 'coach';

  if (!hasAdminAccess) {
    redirect('/dashboard?error=unauthorized');
  }

  // Fetch admin dashboard data
  const data = await getAdminDashboardData();

  return <AdminDashboardClient data={data} />;
}
