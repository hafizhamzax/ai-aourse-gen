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
    // Debugging: Log environment status
    console.log('YouTube API Key:', process.env.NEXT_PUBLIC_YOUTUBE_API_KEY ? '***' + process.env.NEXT_PUBLIC_YOUTUBE_API_KEY.slice(-4) : 'MISSING');
    
    const { query } = await request.json();
    
    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    if (!process.env.NEXT_PUBLIC_YOUTUBE_API_KEY) {
      console.error('YouTube API key is not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const params = {
      part: 'snippet',
      q: query,
      maxResults: 1,
      type: 'video',
      key: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY,
    };

    // Add timeout and better error handling
    const response = await axios.get(`${YOUTUBE_BASE_URL}/search`, {
      params,
      timeout: 5000 // 5 second timeout
    }).catch(error => {
      if (error.response) {
        // YouTube API returned an error
        console.error('YouTube API Error:', error.response.data);
        throw new Error(`YouTube API responded with ${error.response.status}: ${JSON.stringify(error.response.data.error)}`);
      } else if (error.request) {
        // No response received
        console.error('No response from YouTube API');
        throw new Error('No response received from YouTube API');
      } else {
        // Other errors
        console.error('YouTube API Request Error:', error.message);
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
    console.error('Full YouTube API Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch videos',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
