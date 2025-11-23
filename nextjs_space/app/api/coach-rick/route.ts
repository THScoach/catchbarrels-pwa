
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, context, coachingCallId } = await request.json();

    // Search knowledge base for relevant content
    let knowledgeBaseContext = '';
    const knowledgeKeywords = ['drill', 'biomechanics', 'mechanics', 'technique', 'course', 'lesson', 'training', 'swing', 'analysis', 'assessment', 'video', 'exercise', 'movement', 'power', 'rotation'];
    const messageContainsKnowledgeReference = knowledgeKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );

    if (messageContainsKnowledgeReference) {
      // Extract meaningful keywords from the message (filter out common words)
      const stopWords = ['what', 'how', 'can', 'you', 'tell', 'me', 'about', 'the', 'is', 'are', 'do', 'does', 'should', 'i', 'my'];
      const keywords = message.toLowerCase()
        .split(' ')
        .filter((w: string) => w.length > 3 && !stopWords.includes(w))
        .map((w: string) => w.replace(/[^a-z0-9]/g, '')); // Remove punctuation

      console.log('Knowledge base search keywords:', keywords);
      
      // Build search query with OR conditions for each keyword
      const searchConditions = keywords.flatMap((keyword: string) => [
        { title: { contains: keyword, mode: 'insensitive' as const } },
        { content: { contains: keyword, mode: 'insensitive' as const } },
        { description: { contains: keyword, mode: 'insensitive' as const } },
      ]);

      // Search in course titles, descriptions, and lesson content
      const relevantLessons = await prisma.lesson.findMany({
        where: {
          AND: [
            {
              OR: searchConditions.length > 0 ? searchConditions : [{ id: { not: '' } }],
            },
            {
              module: {
                course: {
                  visibility: 'athlete',
                  published: true,
                },
              },
            },
          ],
        },
        include: {
          module: {
            include: {
              course: {
                select: {
                  title: true,
                  category: true,
                },
              },
            },
          },
        },
        take: 3, // Get top 3 most relevant lessons
      });

      if (relevantLessons.length > 0) {
        knowledgeBaseContext = `\n\nTRAINING LIBRARY CONTENT:`;
        relevantLessons.forEach((lesson, idx) => {
          const excerpt = lesson.content ? lesson.content.substring(0, 500) : '';
          knowledgeBaseContext += `\n\n${idx + 1}. From "${lesson.module.course.title}" - ${lesson.title}:
Content: ${excerpt}${excerpt.length === 500 ? '...' : ''}`;
        });
      }
    }

    // If user is asking about a specific coaching call, fetch its transcript
    let coachingCallContext = '';
    if (coachingCallId) {
      const coachingCall = await prisma.coachingCall.findUnique({
        where: { id: coachingCallId },
        select: {
          title: true,
          callDate: true,
          transcript: true,
          topics: true,
        },
      });

      if (coachingCall) {
        coachingCallContext = `\n\nCOACHING CALL CONTEXT:
Call: "${coachingCall.title}" (${new Date(coachingCall.callDate).toLocaleDateString()})
Topics: ${coachingCall.topics.join(', ')}
Full Transcript:
${coachingCall.transcript || 'No transcript available'}`;
      }
    } else {
      // Auto-detect if user is asking about coaching calls and search transcripts
      const coachingKeywords = ['coaching call', 'monday night', 'call about', 'discussed', 'said', 'mentioned', 'talked about'];
      const messageContainsCoachingReference = coachingKeywords.some(keyword => 
        message.toLowerCase().includes(keyword)
      );

      if (messageContainsCoachingReference) {
        // Search transcripts for relevant content
        const searchResults = await prisma.coachingCall.findMany({
          where: {
            transcript: {
              not: null,
            },
          },
          orderBy: {
            callDate: 'desc',
          },
          take: 2, // Get 2 most recent calls
          select: {
            id: true,
            title: true,
            callDate: true,
            transcript: true,
            topics: true,
          },
        });

        if (searchResults.length > 0) {
          coachingCallContext = `\n\nRECENT COACHING CALLS (for reference):`;
          searchResults.forEach((call, idx) => {
            // Extract relevant excerpt based on user's question
            const transcript = call.transcript || '';
            let excerpt = transcript;
            
            // Try to find relevant section (simple keyword matching)
            const words = message.toLowerCase().split(' ').filter((w: string) => w.length > 3);
            for (const word of words) {
              const index = transcript.toLowerCase().indexOf(word);
              if (index !== -1) {
                const start = Math.max(0, index - 200);
                const end = Math.min(transcript.length, index + 300);
                excerpt = transcript.substring(start, end);
                if (start > 0) excerpt = '...' + excerpt;
                if (end < transcript.length) excerpt = excerpt + '...';
                break;
              }
            }

            coachingCallContext += `\n\n${idx + 1}. "${call.title}" (${new Date(call.callDate).toLocaleDateString()})
Topics: ${call.topics.join(', ')}
Relevant excerpt: ${excerpt.substring(0, 500)}...`;
          });
        }
      }
    }

    // Build system prompt for Coach Rick
    const systemPrompt = `You are Coach Rick, a friendly and knowledgeable baseball hitting coach who helps players improve their swing. 

IMPORTANT GUIDELINES:
- Use 8th grade English (simple, clear language)
- Be encouraging and positive
- Use baseball terms but explain them simply
- Keep responses SHORT (2-3 sentences max unless asked for more detail)
- Use emojis occasionally to be friendly ⚾ 💪 🎯
- If asked about the 4Bs system, explain it simply
- When you have coaching call transcript context, reference it naturally in your answers

THE 4Bs SYSTEM (What We Track):
1. ANCHOR (Lower Body) - How your legs and hips work
   - Stance/Setup: How you stand in the box
   - Weight Shift: Moving your weight from back foot to front foot
   - Ground Connection: How well you use the ground to generate power
   - Lower Body Mechanics: Overall leg and hip movement

2. ENGINE (Trunk/Core) - Your core and torso
   - Hip Rotation: How fast and well your hips turn
   - Separation: The gap between your hips and shoulders (creates power)
   - Core Power: Strength from your abs and back
   - Torso Mechanics: How your upper body rotates

3. WHIP (Arms & Bat) - Your hands, arms, and bat
   - Arm Path: The route your hands take to the ball
   - Bat Speed: How fast the bat moves through the zone
   - Bat Control: How well you control where the bat goes
   - Connection: Keeping your arms connected to your body

4. EXIT VELOCITY - How hard you hit the ball (measured in MPH)

CONTEXT YOU HAVE:
${context ? JSON.stringify(context, null, 2) : 'No specific context'}
${coachingCallContext}
${knowledgeBaseContext}

Your job is to help players understand their scores, explain what to work on, and answer questions about hitting mechanics in SIMPLE terms.${coachingCallContext ? '\n\n⚠️ IMPORTANT: When answering questions, DIRECTLY REFERENCE what was discussed in the coaching calls above. Quote specific advice, drills, or recommendations that were mentioned!' : ''}${knowledgeBaseContext ? '\n\n⚠️ IMPORTANT: You have access to training library content above. When answering questions, DIRECTLY REFERENCE the specific courses, lessons, and drills from the training library. Quote the content and tell users where to find more details!' : ''}`;

    // Call Abacus.AI LLM API
    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        temperature: 0.7,
        max_tokens: 300, // Keep responses concise
      }),
    });

    if (!response.ok) {
      throw new Error('LLM API call failed');
    }

    const data = await response.json();
    const coachResponse = data.choices?.[0]?.message?.content || 
      "Hey! I'm having trouble right now. Try asking again in a moment! 🎯";

    return NextResponse.json({ 
      response: coachResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Coach Rick error:', error);
    return NextResponse.json(
      { 
        response: "Oops! I'm having a technical issue. Try again in a sec! ⚾",
        error: 'Failed to generate response' 
      },
      { status: 500 }
    );
  }
}
