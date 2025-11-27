import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testDirectAPI() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('API Key loaded:', !!apiKey);
    console.log('API Key length:', apiKey?.length);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: 'こんにちは。テストです。「こんにちは」と返して。' }]
                }]
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('\n✅ Direct API Call Success!');
            console.log('Response:', data.candidates[0].content.parts[0].text);
        } else {
            console.log('\n❌ Direct API Call Failed!');
            console.log('Status:', response.status);
            console.log('Error:', JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

testDirectAPI();
