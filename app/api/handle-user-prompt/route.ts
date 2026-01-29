// parse prompts from user and handle function calling for calendar operations

import { NextRequest, NextResponse } from 'next/server';
import { handleUserPrompt } from '@/app/service/ai.service';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { checkAndIncrementUsage } from '@/app/service/rate-limit.service';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  if ((session as any).error) {
    return NextResponse.json(
      { error: 'Authentication expired, please sign in again' },
      { status: 401 }
    );
  }

  // Rate limit check
  const userEmail = session.user?.email;
  if (userEmail) {
    const rateLimit = await checkAndIncrementUsage(userEmail);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Daily request limit reached',
          limit: rateLimit.limit,
          remaining: rateLimit.remaining,
          plan: rateLimit.plan,
          message: `You have reached your daily limit of ${rateLimit.limit} AI requests. Upgrade to Premium for unlimited access.`
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(rateLimit.limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Plan': rateLimit.plan
          }
        }
      );
    }
  }

  let body: any = null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  const prompt: string | undefined = body?.prompt;
  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return NextResponse.json(
      { error: 'Invalid body: prompt is required' },
      { status: 400 }
    );
  }

  const timeZone: string | undefined = body?.timeZone;

  try {
    const result = await handleUserPrompt(prompt.trim(), session.accessToken, timeZone);

    // Return result directly - can be a single object or array of objects
    return NextResponse.json(
      result,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error handling prompt:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to handle prompt' },
      { status: 500 }
    );
  }
}