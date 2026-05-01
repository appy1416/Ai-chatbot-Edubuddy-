// ============================================
// YouTube Resources Service — Server-side only
// ============================================

import { YouTubeResource } from '@/types';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';
const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';

export async function searchYouTubeResources(
  query: string,
  maxResults: number = 5
): Promise<YouTubeResource[]> {
  try {
    if (!YOUTUBE_API_KEY) {
      // Return placeholder results when API key is not configured
      return generatePlaceholderResults(query);
    }

    const params = new URLSearchParams({
      part: 'snippet',
      q: `${query} educational tutorial`,
      type: 'video',
      maxResults: maxResults.toString(),
      key: YOUTUBE_API_KEY,
      relevanceLanguage: 'en',
      safeSearch: 'strict',
      videoCategoryId: '27', // Education category
    });

    const response = await fetch(`${YOUTUBE_SEARCH_URL}?${params}`);
    if (!response.ok) throw new Error('YouTube API error');

    const data = await response.json();

    return data.items.map((item: { 
      snippet: { 
        title: string; 
        thumbnails: { medium: { url: string } }; 
        channelTitle: string 
      }; 
      id: { videoId: string } 
    }) => ({
      title: item.snippet.title,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      thumbnail: item.snippet.thumbnails.medium.url,
      channel: item.snippet.channelTitle,
    }));
  } catch (error) {
    console.error('YouTube API Error:', error);
    return generatePlaceholderResults(query);
  }
}

function generatePlaceholderResults(query: string): YouTubeResource[] {
  const searchQuery = encodeURIComponent(`${query} educational tutorial`);
  return [
    {
      title: `Learn ${query} - Complete Tutorial`,
      url: `https://www.youtube.com/results?search_query=${searchQuery}`,
      thumbnail: '',
      channel: 'YouTube Search',
    },
  ];
}
