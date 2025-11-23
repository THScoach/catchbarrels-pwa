import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

// PHASE 1: Simple entry point simulating Whop integration
// PHASE 5: Will integrate actual Whop OAuth here
export default async function HomePage() {
  const session = await getServerSession(authOptions);
  
  if (session) {
    redirect('/dashboard');
  } else {
    // Simulate Whop entry - in production, users come from Whop platform
    redirect('/welcome');
  }
}
