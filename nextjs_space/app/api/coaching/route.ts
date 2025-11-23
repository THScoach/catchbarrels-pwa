
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET - Fetch all coaching sessions (public, for all users)
export async function GET() {
  try {
    const sessions = await prisma.coachingCall.findMany({
      orderBy: {
        callDate: 'desc'
      }
    });
    
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching coaching sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coaching sessions' },
      { status: 500 }
    );
  }
}

// POST - Create a new coaching session (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // TODO: Add admin check here once you have admin roles
    // For now, any logged-in user can add (you can change this later)
    
    const body = await request.json();
    const { title, zoomLink, description, callDate, duration, topics } = body;
    
    // Validate required fields
    if (!title || !zoomLink || !callDate) {
      return NextResponse.json(
        { error: 'Title, Zoom link, and call date are required' },
        { status: 400 }
      );
    }
    
    // Create the coaching session
    const coachingCall = await prisma.coachingCall.create({
      data: {
        title,
        zoomLink,
        description: description || null,
        callDate: new Date(callDate),
        duration: duration ? parseInt(duration) : null,
        topics: topics || []
      }
    });
    
    return NextResponse.json(coachingCall, { status: 201 });
  } catch (error) {
    console.error('Error creating coaching session:', error);
    return NextResponse.json(
      { error: 'Failed to create coaching session' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a coaching session (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }
    
    await prisma.coachingCall.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting coaching session:', error);
    return NextResponse.json(
      { error: 'Failed to delete coaching session' },
      { status: 500 }
    );
  }
}
