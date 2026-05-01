const API_KEY = 'AIzaSyBKodd2744N2Di_zlcJwiXvVPa4Xgadde4';
const MODEL = 'gemini-1.5-flash';
const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

async function test() {
  try {
    const res = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Hello, are you working?' }] }]
      })
    });
    const data = await res.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error:', e);
  }
}

test();
