import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config({ path: '.env.local' });

console.log('Environment check:');
console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
console.log('GEMINI_API_KEY length:', process.env.GEMINI_API_KEY?.length);
console.log('GEMINI_API_KEY first 20:', process.env.GEMINI_API_KEY?.substring(0, 20));

// Test API directly
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function testAPI() {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent('Hello, just testing. Say hi!');
        const response = await result.response;
        console.log('\n✅ API Call Success!');
        console.log('Response:', response.text());
    } catch (error: any) {
        console.log('\n❌ API Call Failed!');
        console.log('Error:', error.message);
        console.log('Status:', error.status);
    }
}

testAPI();
