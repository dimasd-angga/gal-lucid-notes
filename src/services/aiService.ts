import { GoogleGenerativeAI } from '@google/generative-ai';

class AIService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor() {
    // Initialize with API key when available
    this.init();
  }

  private init() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    }
  }

  async generateSummary(content: string): Promise<string> {
    if (!this.model) {
      throw new Error('AI service not initialized. Please provide a valid API key.');
    }

    try {
      const prompt = `Please provide a brief summary of the following note content in 2-3 sentences:\n\n${content}`;
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating summary:', error);
      throw new Error('Failed to generate summary');
    }
  }

  async generateTags(content: string): Promise<string[]> {
    if (!this.model) {
      throw new Error('AI service not initialized. Please provide a valid API key.');
    }

    try {
      const prompt = `Based on the following note content, suggest 3-5 relevant tags (single words or short phrases). Return only the tags separated by commas:\n\n${content}`;
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const tags = response.text().split(',').map(tag => tag.trim().toLowerCase());
      return tags.filter(tag => tag.length > 0);
    } catch (error) {
      console.error('Error generating tags:', error);
      throw new Error('Failed to generate tags');
    }
  }

  async improveWriting(content: string): Promise<string> {
    if (!this.model) {
      throw new Error('AI service not initialized. Please provide a valid API key.');
    }

    try {
      const prompt = `Please improve the following text by making it clearer, more concise, and better structured while maintaining the original meaning:\n\n${content}`;
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error improving writing:', error);
      throw new Error('Failed to improve writing');
    }
  }

  isAvailable(): boolean {
    return this.model !== null;
  }
}

export const aiService = new AIService();