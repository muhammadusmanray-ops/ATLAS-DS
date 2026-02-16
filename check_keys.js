
import { GoogleGenAI } from "@google/genai";
import fs from "fs";

async function check() {
    const keys = [
        '', // Primary
        ''  // From test-key.js
    ];

    let results = "KEY DIAGNOSTICS:\n";
    for (const apiKey of keys) {
        results += `\nTesting Key: ${apiKey.substring(0, 10)}...\n`;
        const genAI = new GoogleGenAI({ apiKey, apiVersion: 'v1beta' });
        try {
            const result = await genAI.models.generateContent({
                model: 'gemini-2.0-flash-lite',
                contents: [{ role: 'user', parts: [{ text: 'Ping' }] }]
            });
            results += `âœ… SUCCESS: ${result.response.text().trim()}\n`;
        } catch (e) {
            results += `âŒ FAILED: ${e.status} - ${e.message}\n`;
        }
    }
    fs.writeFileSync('key_test_results.txt', results);
}
check();
