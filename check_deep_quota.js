
import { GoogleGenAI } from "@google/genai";
import fs from "fs";

async function check() {
    const keys = [
        '',
        ''
    ];

    const testModels = [
        'gemini-2.0-flash',
        'gemini-2.0-flash-lite',
        'gemini-2.5-flash',
        'gemini-2.5-flash-lite',
        'gemini-flash-latest'
    ];

    let results = "DEEP QUOTA SCAN:\n";
    for (const apiKey of keys) {
        results += `\n--- Key: ${apiKey.substring(0, 10)}... ---\n`;
        const genAI = new GoogleGenAI({ apiKey, apiVersion: 'v1beta' });
        for (const model of testModels) {
            try {
                const result = await genAI.models.generateContent({
                    model,
                    contents: [{ role: 'user', parts: [{ text: 'Ping' }] }]
                });
                results += `âœ… ${model}: ACTIVE\n`;
            } catch (e) {
                results += `âŒ ${model}: ${e.status || 'ERROR'} - ${e.message.substring(0, 50)}...\n`;
            }
        }
    }
    fs.writeFileSync('deep_quota_results.txt', results);
}
check();
