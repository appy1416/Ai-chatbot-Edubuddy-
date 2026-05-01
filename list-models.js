const API_KEY = 'AIzaSyBKodd2744N2Di_zlcJwiXvVPa4Xgadde4';
const URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

async function listModels() {
  try {
    const res = await fetch(URL);
    const data = await res.json();
    console.log('Available Models:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error:', e);
  }
}

listModels();
