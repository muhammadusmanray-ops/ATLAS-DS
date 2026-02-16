
import { GoogleGenAI } from "@google/genai";
import fs from "fs";

async function check() {
    const content = fs.readFileSync('.env.local', 'utf8');
    const apiKey = content.split('API_KEY=')[1]?.split('\n')[0]?.trim();

    if (!apiKey) {
        console.log("NO KEY");
        return;
    }

    const genAI = new GoogleGenAI({ apiKey, apiVersion: 'v1beta' });

    const models = ['gemini-2.0-flash'];
    for (const model of models) {
        try {
            const result = await genAI.models.generateContent({
                model,
                contents: [{ role: 'user', parts: [{ text: 'Operational Check' }] }]
            });
            console.log(`âœ… ${model} ALIVE: ${result.response.text()}`);
        } catch (e) {
            console.log(`âŒ ${model} ERROR: ${e.message}`);
        }
    }
}
check();
