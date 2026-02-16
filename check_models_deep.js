
import { GoogleGenAI } from "@google/genai";
import fs from "fs";

async function check() {
    const content = fs.readFileSync('.env.local', 'utf8');
    const apiKey = content.split('API_KEY=')[1]?.split('\n')[0]?.trim();

    if (!apiKey) {
        fs.writeFileSync('model_list.txt', "NO KEY FOUND");
        return;
    }

    const genAI = new GoogleGenAI({ apiKey, apiVersion: 'v1beta' });

    try {
        const pager = await genAI.models.list();
        let list = "v1beta models:\n";
        for (const model of pager.page) {
            list += `- ${model.name}\n`;
        }

        const genAIv1 = new GoogleGenAI({ apiKey, apiVersion: 'v1' });
        const pagerV1 = await genAIv1.models.list();
        list += "\nv1 models:\n";
        for (const model of pagerV1.page) {
            list += `- ${model.name}\n`;
        }

        fs.writeFileSync('model_list.txt', list);
        console.log("DONE");
    } catch (e) {
        fs.writeFileSync('model_list.txt', "ERROR: " + e.message);
        console.log("ERROR");
    }
}
check();
