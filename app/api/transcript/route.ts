import { NextRequest, NextResponse } from 'next/server';
import { YouTubeTranscriptService } from '@/lib/youtube-transcript';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { videoUrl } = await request.json();

    if (!videoUrl) {
      return NextResponse.json(
        { error: 'Video URL is required' },
        { status: 400 }
      );
    }

    const transcriptService = new YouTubeTranscriptService();
    const transcript = await transcriptService.fetchTranscript(videoUrl);

    return NextResponse.json({ transcript });
  } catch (error) {
    console.error('Error fetching transcript:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to fetch transcript';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
