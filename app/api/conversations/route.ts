import { NextRequest, NextResponse } from 'next/server';
import { conversationStorage } from '@/lib/conversation-storage';

// GET /api/conversations - Get all conversation summaries
// GET /api/conversations/[sessionId] - Get specific conversation
// DELETE /api/conversations/[sessionId] - Delete specific conversation
// POST /api/conversations/clear - Clear all conversations

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  try {
    if (sessionId) {
      // Get specific conversation
      const conversation = conversationStorage.getConversation(sessionId);
      if (!conversation) {
        return NextResponse.json(
          { error: 'Conversation not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ conversation });
    } else {
      // Get all conversation summaries
      const sessionIds = conversationStorage.getAllSessionIds();
      const summaries = sessionIds.map(id => ({
        sessionId: id,
        ...conversationStorage.getConversationSummary(id)
      }));
      return NextResponse.json({ conversations: summaries });
    }
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Session ID is required' },
      { status: 400 }
    );
  }

  try {
    const deleted = conversationStorage.deleteConversation(sessionId);
    if (!deleted) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return NextResponse.json(
      { error: 'Failed to delete conversation' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { action } = await request.json();

  if (action === 'clear') {
    try {
      conversationStorage.clearAll();
      return NextResponse.json({ success: true, message: 'All conversations cleared' });
    } catch (error) {
      console.error('Error clearing conversations:', error);
      return NextResponse.json(
        { error: 'Failed to clear conversations' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    { error: 'Invalid action' },
    { status: 400 }
  );
}
