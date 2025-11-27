import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        );

        const data = await response.json();

        console.log('Available Gemini Models:\n');

        if (data.models) {
            data.models
                .filter((m: any) => m.name.includes('gemini'))
                .forEach((model: any) => {
                    console.log(`- ${model.name.replace('models/', '')}`);
                    console.log(`  Methods: ${model.supportedGenerationMethods.join(', ')}`);
                    console.log('');
                });
        } else {
            console.log('Error:', data.error);
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

listModels();
