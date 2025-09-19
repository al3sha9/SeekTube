import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { question, transcript, chatHistory } = await request.json();

    if (!question || !transcript) {
      return NextResponse.json(
        { error: 'Question and transcript are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const historyContext = chatHistory && chatHistory.length > 0 
      ? `\n\nChat History:\n${chatHistory.slice(-6).map((msg: any) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n')}`
      : '';

    const prompt = `You are an AI assistant that helps users understand and discuss a YouTube video based on its transcript. 
You have access to the full transcript of the video and can answer questions about its content, themes, key points, and provide insights.

Video Transcript:
${transcript}${historyContext}

Guidelines:
- Answer questions based solely on the content of the video transcript
- Be conversational and engaging
- If asked about something not covered in the transcript, politely mention that the information isn't available in this video
- Provide timestamps when referencing specific parts of the video
- Feel free to summarize, explain concepts, or make connections between different parts of the video
- If the user asks for clarification or follow-up questions, use the context from previous messages

Current Question: ${question}

Response:`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error('Chat API error:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to generate response';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
