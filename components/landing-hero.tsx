'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Play } from 'lucide-react';

interface LandingHeroProps {
  onFetchTranscript: (url: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export function LandingHero({ onFetchTranscript, isLoading = false, error }: LandingHeroProps) {
  const [url, setUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    await onFetchTranscript(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center max-w-4xl mx-auto"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
              <Play className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
            Seek
            <span className=" text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-red-500">
              Tube
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
            Paste a link, fetch the transcript, and ask anything about the video
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <Card className="backdrop-blur-md bg-white/95 border-0 shadow-2xl max-w-2xl mx-auto">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="youtube-url" className="text-sm font-medium text-gray-700 block">
                    YouTube Video URL
                  </label>
                  <Input
                    id="youtube-url"
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="h-14 text-lg rounded-2xl border-2 focus:border-red-500 focus:ring-red-500/20"
                    disabled={isLoading}
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={!url.trim() || isLoading}
                  className="w-full h-14 text-lg font-semibold rounded-2xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                    />
                  ) : (
                    <Play className="w-5 h-5 mr-2" />
                  )}
                  {isLoading ? 'Fetching Transcript...' : 'Fetch Transcript'}
                </Button>
              </form>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Supports YouTube videos with available transcripts
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}