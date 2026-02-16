
import { GoogleGenAI } from "@google/genai";
import fs from "fs";

async function check() {
    const keys = [
        '',
        ''
    ];

    const modelAliases = [
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-2.0-flash-lite',
        'gemini-1.5-flash',
        'gemini-1.5-flash-latest',
        'gemini-flash-latest',
        'gemini-pro-latest'
    ];

    let results = "COMPREHENSIVE MODEL SCAN:\n";
    for (const apiKey of keys) {
        results += `\n--- Key: ${apiKey.substring(0, 10)}... ---\n`;
        const genAI = new GoogleGenAI({ apiKey, apiVersion: 'v1beta' });
        for (const model of modelAliases) {
            try {
                const result = await genAI.models.generateContent({
                    model,
                    contents: [{ role: 'user', parts: [{ text: 'Operational Check' }] }]
                });
                results += `âœ… ${model}: ACTIVE (Response: ${result.text?.substring(0, 20)}...)\n`;
            } catch (e) {
                results += `âŒ ${model}: ${e.status || 'ERROR'} - ${e.message.substring(0, 40)}...\n`;
            }
        }
    }
    fs.writeFileSync('final_model_scan.txt', results);
}
check();
