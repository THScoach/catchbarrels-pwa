
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import AssessmentReportClient from './assessment-report-client';

export const dynamic = 'force-dynamic';

export default async function AssessmentReportPage({
  params
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/welcome');
  }

  const assessmentId = params.id;

  // Fetch report data from API
  const reportResponse = await fetch(
    `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/assessments/${assessmentId}/report`,
    {
      headers: {
        cookie: `next-auth.session-token=${session.user.id}`
      },
      cache: 'no-store'
    }
  );

  if (!reportResponse.ok) {
    redirect('/dashboard');
  }

  const reportData = await reportResponse.json();

  // Fetch trial eligibility
  const trialResponse = await fetch(
    `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/trial/activate`,
    {
      headers: {
        cookie: `next-auth.session-token=${session.user.id}`
      },
      cache: 'no-store'
    }
  );

  let trialStatus = null;
  if (trialResponse.ok) {
    trialStatus = await trialResponse.json();
  }

  return <AssessmentReportClient report={reportData.report} trialStatus={trialStatus} />;
}
