
const CONFIRMED_GROQ_KEY = '';

async function testGroqChat() {
    const body = {
        model: 'llama-3.3-70b-versatile',
        messages: [
            { role: 'system', content: 'You are a tactical assistant.' },
            { role: 'user', content: 'Respond with "Llama Active" if you can hear me.' }
        ],
        temperature: 0.7
    };

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CONFIRMED_GROQ_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const data = await response.json();
            console.log("Groq Error:", JSON.stringify(data));
        } else {
            const data = await response.json();
            console.log("Groq Success:", data.choices[0].message.content);
        }
    } catch (e) {
        console.error("Fetch Error:", e);
    }
}

testGroqChat();
