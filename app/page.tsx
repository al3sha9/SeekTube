'use client';

import { useState } from 'react';
import { LandingHero } from '@/components/landing-hero';
import { MainAppView } from '@/components/main-app-view';
import { VideoTalkAgent } from '@/lib/video-talk-agent';

export default function Home() {
  const [hasTranscript, setHasTranscript] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [transcript, setTranscript] = useState('');
  const [talkAgent, setTalkAgent] = useState<VideoTalkAgent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchTranscript = async (url: string) => {
    setIsLoading(true);
    setError(null);
    setVideoUrl(url);
    
    try {
      const response = await fetch('/api/transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl: url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch transcript');
      }

      const fetchedTranscript = data.transcript;
      setTranscript(fetchedTranscript);
      
      // Initialize the talk agent with the transcript
      const agent = new VideoTalkAgent(fetchedTranscript);
      setTalkAgent(agent);
      
      setHasTranscript(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transcript';
      setError(errorMessage);
      console.error('Error fetching transcript:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasTranscript) {
    return (
      <LandingHero 
        onFetchTranscript={handleFetchTranscript} 
        isLoading={isLoading}
        error={error}
      />
    );
  }

  return (
    <MainAppView 
      videoUrl={videoUrl} 
      transcript={transcript} 
      talkAgent={talkAgent}
    />
  );
}