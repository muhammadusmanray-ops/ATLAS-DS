
import fs from 'fs';

async function checkGroqModels() {
    const apiKey = '';
    try {
        const response = await fetch('https://api.groq.com/openai/v1/models', {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        fs.writeFileSync('groq_models.json', JSON.stringify(data, null, 2));
        console.log("Groq models saved to groq_models.json");
    } catch (e) {
        console.error("Groq model check failed:", e);
    }
}

checkGroqModels();
