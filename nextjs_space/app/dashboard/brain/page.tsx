import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import BrainDashboardClient from './brain-client'

export default async function BrainDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/login')
  }

  // TODO: Fetch real brain test data from database
  // For now, using mock data for demo
  const mockData = {
    currentScore: 85,
    bestScore: 92,
    testsCompleted: 7,
    sessions: [
      {
        id: '1',
        date: new Date('2025-11-20'),
        score: 85,
        testType: 'Reaction Time',
        duration: '5 min',
      },
      {
        id: '2',
        date: new Date('2025-11-15'),
        score: 82,
        testType: 'Decision Making',
        duration: '6 min',
      },
      {
        id: '3',
        date: new Date('2025-11-10'),
        score: 88,
        testType: 'Reaction Time',
        duration: '5 min',
      },
      {
        id: '4',
        date: new Date('2025-11-05'),
        score: 92,
        testType: 'Visual Processing',
        duration: '7 min',
      },
      {
        id: '5',
        date: new Date('2025-10-30'),
        score: 79,
        testType: 'Decision Making',
        duration: '6 min',
      },
      {
        id: '6',
        date: new Date('2025-10-25'),
        score: 81,
        testType: 'Reaction Time',
        duration: '5 min',
      },
      {
        id: '7',
        date: new Date('2025-10-20'),
        score: 76,
        testType: 'Visual Processing',
        duration: '7 min',
      },
    ],
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BrainDashboardClient data={mockData} />
    </Suspense>
  )
}
