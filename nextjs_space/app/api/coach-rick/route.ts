
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, context } = await request.json();

    // Build system prompt for Coach Rick
    const systemPrompt = `You are Coach Rick, a friendly and knowledgeable baseball hitting coach who helps players improve their swing. 

IMPORTANT GUIDELINES:
- Use 8th grade English (simple, clear language)
- Be encouraging and positive
- Use baseball terms but explain them simply
- Keep responses SHORT (2-3 sentences max unless asked for more detail)
- Use emojis occasionally to be friendly ⚾ 💪 🎯
- If asked about the 4Bs system, explain it simply

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

Your job is to help players understand their scores, explain what to work on, and answer questions about hitting mechanics in SIMPLE terms.`;

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
