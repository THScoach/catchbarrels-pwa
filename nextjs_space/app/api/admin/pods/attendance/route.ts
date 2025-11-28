import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    if (userRole !== 'admin' && userRole !== 'coach') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { bookingId, status } = await request.json();

    if (!bookingId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (status !== 'attended' && status !== 'no_show') {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const booking = await prisma.podBooking.update({
      where: { id: bookingId },
      data: {
        status,
        attendedAt: status === 'attended' ? new Date() : null,
        markedBy: (session?.user as any)?.id,
      },
    });

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error('[Admin POD Attendance] Error:', error);
    return NextResponse.json({ error: 'Failed to update attendance' }, { status: 500 });
  }
}
