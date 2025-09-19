import { NextRequest, NextResponse } from 'next/server';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { BufferMemory } from 'langchain/memory';
import { ConversationChain } from 'langchain/chains';
import { PromptTemplate } from '@langchain/core/prompts';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { conversationStorage } from '@/lib/conversation-storage';

// Initialize the Gemini model
const model = new ChatGoogleGenerativeAI({
  model: 'gemini-1.5-flash',
  temperature: 0.7,
  apiKey: process.env.GOOGLE_API_KEY,
});

// Create a custom prompt template for video context awareness
const videoContextPrompt = PromptTemplate.fromTemplate(`
You are a helpful AI assistant designed to answer questions about video content. You have access to the full transcript of a video and should use this information to provide accurate, contextual responses.

Video Transcript:
{transcript}

Current conversation:
{history}

Instructions:
1. Use the video transcript as your primary source of information
2. Maintain context from previous messages in the conversation
3. Provide specific references to parts of the video when relevant
4. If a question cannot be answered from the transcript, clearly state that
5. Be helpful, accurate, and engaging in your responses
6. Keep track of what has been discussed to avoid repetition`);

// Store for conversation memories (in production, use a database)
const conversationMemories = new Map<string, BufferMemory>();

// Helper function to get or create memory for a session
function getOrCreateMemory(sessionId: string): BufferMemory {
  if (!conversationMemories.has(sessionId)) {
    const memory = new BufferMemory({
      returnMessages: true,
      memoryKey: 'history',
    });
    conversationMemories.set(sessionId, memory);
  }
  return conversationMemories.get(sessionId)!;
}

export async function POST(request: NextRequest) {
  try {
    const { question, transcript, chatHistory, sessionId = 'default' } = await request.json();

    if (!question || !transcript) {
      return NextResponse.json(
        { error: 'Question and transcript are required' },
        { status: 400 }
      );
    }

    // Get or create conversation in storage
    let conversation = conversationStorage.getConversation(sessionId);
    if (!conversation) {
      conversation = conversationStorage.createConversation(sessionId, transcript);
    }

    // Get conversation memory for this session
    const memory = getOrCreateMemory(sessionId);

    // Load conversation history into memory
    for (let i = 0; i < conversation.messages.length; i += 2) {
      const userMsg = conversation.messages[i];
      const assistantMsg = conversation.messages[i + 1];

      if (userMsg && assistantMsg && userMsg.role === 'user' && assistantMsg.role === 'assistant') {
        await memory.saveContext(
          { input: userMsg.content },
          { output: assistantMsg.content }
        );
      }
    }

    // Create conversation chain with memory
    const chain = new ConversationChain({
      llm: model,
      memory: memory,
      prompt: PromptTemplate.fromTemplate(`
You are a helpful AI assistant designed to answer questions about video content. You have access to the full transcript of a video and should use this information to provide accurate, contextual responses.

Video Transcript:
${transcript}

{history}
Human: {input}
Assistant:`),
    });

    // Save user message to storage
    conversationStorage.addMessage(sessionId, 'user', question);

    // Generate response - ConversationChain only expects 'input'
    const response = await chain.predict({
      input: question,
    });

    // Save assistant response to storage
    conversationStorage.addMessage(sessionId, 'assistant', response);

    return NextResponse.json({ response });

  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}