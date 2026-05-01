import { NextRequest, NextResponse } from 'next/server';
import { searchYouTubeResources } from '@/services/youtube';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
    }

    const resources = await searchYouTubeResources(query);
    return NextResponse.json({ resources });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 });
  }
}
