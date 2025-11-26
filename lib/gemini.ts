import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function summarizeText(text: string): Promise<string> {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
    Summarize the following text in Japanese. 
    Focus on the key facts, insights, and implications.
    Keep it concise (around 200-300 characters).
    
    Text:
    ${text.substring(0, 10000)} // Limit input length
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Summarization Error:', error);
        return 'Summary unavailable.';
    }
}

export async function generateEmbedding(text: string): Promise<number[]> {
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });

    try {
        const result = await model.embedContent(text);
        return result.embedding.values;
    } catch (error) {
        console.error('Embedding Error:', error);
        return [];
    }
}
