import http from 'http';

const payload = JSON.stringify({
  message: 'Explain Newton third law of motion in brief',
  subject: 'physics',
  language: 'english'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/chat',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
};

console.log('Sending request...');
const startTime = Date.now();

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    try {
      const parsed = JSON.parse(data);
      console.log(`✅ Response in ${elapsed}s (HTTP ${res.statusCode})`);
      console.log('Answer:', parsed.message?.slice(0, 500));
    } catch(e) {
      console.log(`❌ Parse error after ${elapsed}s. Raw:`, data.slice(0, 300));
    }
  });
});

req.on('error', e => console.error('Request error:', e.message));
req.setTimeout(180000, () => { req.destroy(); console.error('Timed out after 3 mins'); });
req.write(payload);
req.end();
