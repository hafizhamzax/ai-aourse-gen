// // app/api/youtube/search/route.js
// import { NextResponse } from 'next/server';
// import axios from 'axios';

// const YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// export async function POST(request) {
//   try {
//     const { query } = await request.json();

//     const params = {
//       part: 'snippet',
//       q: query,
//       maxResults: 1,
//       key: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY,
//     };

//     const response = await axios.get(`${YOUTUBE_BASE_URL}/search`, { params });
//     return NextResponse.json(response.data.items);
//   } catch (error) {
//     console.error("YouTube API Error:", error.message);
//     return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
//   }
// }


import { NextResponse } from 'next/server';
import axios from 'axios';

const YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3';

export async function POST(request) {
  try {
    const { query, maxResults, order, type, duration, relevanceLanguage, regionCode, safeSearch, channelId } = await request.json();
    console.log("YouTube Search for:", query);

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    if (!process.env.NEXT_PUBLIC_YOUTUBE_API_KEY) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const params = {
      part: 'snippet',
      q: query,
      maxResults: Math.min(Math.max(Number(maxResults) || 10, 1), 50),
      type: type || 'video',
      order: order || 'relevance',
      videoDuration: duration || undefined,
      relevanceLanguage: relevanceLanguage || undefined,
      regionCode: regionCode || undefined,
      safeSearch: safeSearch || 'moderate',
      channelId: channelId || undefined,
      key: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY,
    };

    const response = await axios.get(`${YOUTUBE_BASE_URL}/search`, {
      params,
      timeout: 8000
    }).catch(error => {
      if (error.response) {
        throw new Error(`YouTube API responded with ${error.response.status}: ${JSON.stringify(error.response.data?.error || error.response.data)}`);
      } else if (error.request) {
        throw new Error('No response received from YouTube API');
      } else {
        throw error;
      }
    });

    if (!response.data.items || response.data.items.length === 0) {
      return NextResponse.json(
        { error: 'No videos found matching your query' },
        { status: 404 }
      );
    }

    return NextResponse.json(response.data.items);
  } catch (error) {
    console.error("YouTube Search Error:", error.message);
    // Return empty array instead of 500 to allow course generation to continue without video
    return NextResponse.json([], { status: 200 });
  }
}
