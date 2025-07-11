import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor() {
    this.init();
  }

  private init() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    }
  }

  async generateContent(prompt: string): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini API not initialized. Please check your API key.');
    }

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error('Gemini API error:', error);
      throw new Error(`Failed to generate content: ${error.message}`);
    }
  }

  isAvailable(): boolean {
    return this.model !== null;
  }
}

export const geminiService = new GeminiService();

// AI Helper Functions
export const summarizeText = async (text: string): Promise<string> => {
  if (text.length < 100) {
    throw new Error('Text must be at least 100 characters long to summarize.');
  }

  const prompt = `Please provide a concise summary of the following text in 2-3 sentences. Focus on the main points and key information:

${text}`;

  return await geminiService.generateContent(prompt);
};

export const generateTitle = async (content: string): Promise<string> => {
  if (content.length < 20) {
    throw new Error('Content must be at least 20 characters long to generate a title.');
  }

  const prompt = `Generate a concise, descriptive title (maximum 60 characters) for the following note content:

${content}`;

  return await geminiService.generateContent(prompt);
};

export const generateTitleSuggestions = async (content: string): Promise<string[]> => {
  if (content.length < 50) {
    throw new Error('Content must be at least 50 characters long to generate title suggestions.');
  }

  const prompt = `Generate 4 concise, specific titles for this note content. Make them descriptive but under 60 characters each. Return only the titles, one per line:

${content.substring(0, 300)}...`;

  const response = await geminiService.generateContent(prompt);
  return response
    .split('\n')
    .map(title => title.trim().replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, ''))
    .filter(title => title.length > 0 && title.length <= 60)
    .slice(0, 4);
};

export const expandContent = async (content: string): Promise<string> => {
  if (content.length < 20) {
    throw new Error('Content must be at least 20 characters long to expand.');
  }

  const prompt = `Expand and improve the following content. Make it more detailed, clear, and well-structured while maintaining the original meaning and tone:

${content}`;

  return await geminiService.generateContent(prompt);
};

export const getWritingHelp = async (content: string): Promise<string> => {
  const prompt = content.length > 0 
    ? `Provide helpful writing suggestions for improving this content. Focus on clarity, structure, and engagement:

${content}`
    : `Provide general writing tips and suggestions for effective note-taking and content creation.`;

  return await geminiService.generateContent(prompt);
};
export const improveWriting = async (text: string): Promise<string> => {
  if (text.length < 50) {
    throw new Error('Text must be at least 50 characters long to improve.');
  }

  const prompt = `Please improve the following text by making it clearer, more concise, and better structured while maintaining the original meaning and tone:

${text}`;

  return await geminiService.generateContent(prompt);
};

export const generateTags = async (content: string): Promise<string[]> => {
  if (content.length < 30) {
    throw new Error('Content must be at least 30 characters long to generate tags.');
  }

  const prompt = `Based on the following content, suggest 3-5 relevant tags (single words or short phrases, lowercase). Return only the tags separated by commas:

${content}`;

  const response = await geminiService.generateContent(prompt);
  return response
    .split(',')
    .map(tag => tag.trim().toLowerCase())
    .filter(tag => tag.length > 0 && tag.length <= 20)
    .slice(0, 5);
};