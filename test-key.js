
async function testKey() {
    const key = '';
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        const response = await fetch(url, {
            method: 'GET'
        });
        console.log('Status:', response.status);
        const text = await response.text();
        console.log('Body:', text);
    } catch (e) {
        console.error('Fetch Test Failed:', e);
    }
}
testKey();
