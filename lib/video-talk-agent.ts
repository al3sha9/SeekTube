export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export class VideoTalkAgent {
  private transcript: string;
  private chatHistory: ChatMessage[];

  constructor(transcript: string) {
    this.transcript = transcript;
    this.chatHistory = [];
  }

  async askQuestion(question: string): Promise<string> {
    try {
      // Add user message to history
      const userMessage: ChatMessage = {
        role: 'user',
        content: question,
        timestamp: new Date()
      };
      this.chatHistory.push(userMessage);

      // Call the API route
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question,
          transcript: this.transcript,
          chatHistory: this.chatHistory
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate response');
      }

      const assistantResponse = data.response;

      // Add assistant response to history
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: assistantResponse,
        timestamp: new Date()
      };
      this.chatHistory.push(assistantMessage);

      return assistantResponse;
    } catch (error) {
      console.error('Error generating response:', error);
      throw new Error('Failed to generate response. Please try again.');
    }
  }

  getChatHistory(): ChatMessage[] {
    return [...this.chatHistory];
  }

  clearHistory(): void {
    this.chatHistory = [];
  }

  updateTranscript(newTranscript: string): void {
    this.transcript = newTranscript;
    this.clearHistory(); // Clear history when transcript changes
  }

  // Helper method to get video summary
  async getVideoSummary(): Promise<string> {
    const summaryQuestion = "Please provide a comprehensive summary of this video, including the main topics covered, key points, and any important insights or conclusions.";
    return await this.askQuestion(summaryQuestion);
  }

  // Helper method to get key takeaways
  async getKeyTakeaways(): Promise<string> {
    const takeawaysQuestion = "What are the 5 most important takeaways or lessons from this video?";
    return await this.askQuestion(takeawaysQuestion);
  }
}
