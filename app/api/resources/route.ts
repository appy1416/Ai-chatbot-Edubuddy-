import { NextRequest, NextResponse } from 'next/server';
import { searchYouTubeResources } from '@/services/youtube';
import { validateAuth, unauthorizedResponse } from '@/lib/auth-guard';
import type { Subject, SupportedLanguage } from '@/types';

// GET — Search for learning resources (YouTube videos)
export async function GET(request: NextRequest) {
  const auth = await validateAuth(request);
  if (!auth.authenticated) return unauthorizedResponse(auth.error);

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const subject = searchParams.get('subject') as Subject | null;
    const language = searchParams.get('language') as SupportedLanguage | null;
    const limit = Math.min(parseInt(searchParams.get('limit') || '5'), 10);

    if (!query?.trim()) {
      return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
    }

    // Enhance search query with subject context
    let enrichedQuery = query;
    if (subject && subject !== 'general') {
      enrichedQuery = `${subject.replace('_', ' ')} ${query}`;
    }
    if (language && language !== 'english') {
      enrichedQuery += ` ${language}`;
    }

    const resources = await searchYouTubeResources(enrichedQuery, limit);

    return NextResponse.json({
      resources,
      count: resources.length,
      query: enrichedQuery,
    });
  } catch (error) {
    console.error('[Resources API] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 });
  }
}
