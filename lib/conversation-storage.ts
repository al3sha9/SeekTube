// Simple in-memory storage for conversation history
// In production, you would use a database like Redis, PostgreSQL, or MongoDB

export interface ConversationHistory {
  sessionId: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  transcript: string;
  createdAt: Date;
  updatedAt: Date;
}

class ConversationStorage {
  private conversations: Map<string, ConversationHistory> = new Map();

  // Save conversation
  saveConversation(sessionId: string, history: ConversationHistory): void {
    history.updatedAt = new Date();
    this.conversations.set(sessionId, history);
  }

  // Get conversation by session ID
  getConversation(sessionId: string): ConversationHistory | null {
    return this.conversations.get(sessionId) || null;
  }

  // Create new conversation
  createConversation(sessionId: string, transcript: string): ConversationHistory {
    const conversation: ConversationHistory = {
      sessionId,
      messages: [],
      transcript,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.conversations.set(sessionId, conversation);
    return conversation;
  }

  // Add message to conversation
  addMessage(
    sessionId: string,
    role: 'user' | 'assistant',
    content: string
  ): void {
    const conversation = this.conversations.get(sessionId);
    if (conversation) {
      conversation.messages.push({
        role,
        content,
        timestamp: new Date(),
      });
      conversation.updatedAt = new Date();
    }
  }

  // Clear all conversations (for development/testing)
  clearAll(): void {
    this.conversations.clear();
  }

  // Get all conversation IDs
  getAllSessionIds(): string[] {
    return Array.from(this.conversations.keys());
  }

  // Delete conversation
  deleteConversation(sessionId: string): boolean {
    return this.conversations.delete(sessionId);
  }

  // Get conversation summary
  getConversationSummary(sessionId: string): {
    messageCount: number;
    lastActivity: Date;
    transcript: string;
  } | null {
    const conversation = this.conversations.get(sessionId);
    if (!conversation) return null;

    return {
      messageCount: conversation.messages.length,
      lastActivity: conversation.updatedAt,
      transcript: conversation.transcript,
    };
  }
}

// Export singleton instance
export const conversationStorage = new ConversationStorage();
