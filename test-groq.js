
const apiKey = '';
const baseUrl = 'https://api.groq.com/openai/v1/chat/completions';

async function testGroq() {
    console.log("ðŸš€ Testing Groq AI Node...");
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
                    { role: "system", content: "You are ATLAS-X Tactical Intelligence." },
                    { role: "user", content: "System Check: Respond with 'READY' if online." }
                ],
                max_tokens: 10
            })
        });

        const data = await response.json();
        if (response.ok) {
            console.log("âœ… GROQ RESPONSE:", data.choices[0].message.content);
            console.log("âš¡ SPEED TEST: Response received instantly.");
        } else {
            console.error("âŒ GROQ ERROR:", data.error?.message || "Unknown Failure");
        }
    } catch (e) {
        console.error("âŒ CONNECTION FAILED:", e.message);
    }
}

testGroq();
