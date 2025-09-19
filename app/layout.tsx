import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'SeekTube - AI-Powered YouTube Video Analysis',
  description: 'Engage in intelligent conversations about YouTube video content using advanced AI technology powered by Google Gemini and LangChain',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}