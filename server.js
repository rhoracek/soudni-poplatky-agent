const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.ANTHROPIC_API_KEY || '';

// Read HTML - try multiple locations
function getHtml() {
  const locations = [
    path.join(__dirname, 'index.html'),
    path.join(process.cwd(), 'index.html'),
    './index.html'
  ];
  for (const loc of locations) {
    try {
      const content = fs.readFileSync(loc);
      console.log('index.html nalezen: ' + loc);
      return content;
    } catch (e) {}
  }
  console.error('CHYBA: index.html nenalezen! Hledano v:', locations);
  return Buffer.from('<h1>index.html nenalezen</h1>');
}

const HTML = getHtml();

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // Health check
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, hasKey: !!API_KEY }));
    return;
  }

  // Serve HTML
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(HTML);
    return;
  }

  // Proxy to Anthropic API
  if (req.method === 'POST' && req.url === '/api/messages') {
    if (!API_KEY) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: { message: 'ANTHROPIC_API_KEY neni nastavena na serveru. Pridejte ji v Railway -> Variables.' } }));
      return;
    }

    let body = '';
    req.on('data', d => { body += d; });
    req.on('end', () => {
      const options = {
        hostname: 'api.anthropic.com',
        path: '/v1/messages',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Length': Buffer.byteLength(body)
        }
      };
      const apiReq = https.request(options, apiRes => {
        let data = '';
        apiRes.on('data', d => { data += d; });
        apiRes.on('end', () => {
          res.writeHead(apiRes.statusCode, { 'Content-Type': 'application/json' });
          res.end(data);
        });
      });
      apiReq.on('error', e => {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: { message: 'API chyba: ' + e.message } }));
      });
      apiReq.write(body);
      apiReq.end();
    });
    return;
  }

  res.writeHead(404); res.end('Not found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('=================================');
  console.log('Poplatkovy agent spusten na portu ' + PORT);
  console.log('API klic: ' + (API_KEY ? 'NASTAVEN (' + API_KEY.substring(0, 12) + '...)' : 'CHYBI!'));
  console.log('=================================');
});

server.on('error', err => {
  console.error('Server chyba:', err);
});
