const apiKey = '';
const baseUrl = 'https://api.groq.com/openai/v1/chat/completions';

async function testGroq() {
    console.log("ðŸš€ Testing NEW Groq AI Key...");
    try {
        const response = await fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: "You are ATLAS-X." },
                    { role: "user", content: "Verify: ONLINE" }
                ],
                max_tokens: 10
            })
        });

        const data = await response.json();
        if (response.ok) {
            console.log("âœ… SUCCESS! Response:", data.choices[0].message.content);
        } else {
            console.error("âŒ KEY REJECTED:", data.error?.message || "Unauthorized");
        }
    } catch (e) {
        console.error("âŒ NETWORK ERROR:", e.message);
    }
}

testGroq();
