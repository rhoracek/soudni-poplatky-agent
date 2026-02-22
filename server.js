const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

const PORT = 3000;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

if (!ANTHROPIC_API_KEY) {
  console.error('\x1b[31mChyba: Nastavte promennou ANTHROPIC_API_KEY\x1b[0m');
  console.error('  Windows: set ANTHROPIC_API_KEY=sk-ant-...');
  console.error('  Mac/Linux: export ANTHROPIC_API_KEY=sk-ant-...');
  process.exit(1);
}

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // Serve HTML
  if (req.method === 'GET' && req.url === '/') {
    const html = fs.readFileSync(path.join(__dirname, 'index.html'));
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(html);
    return;
  }

  // Proxy API calls
  if (req.method === 'POST' && req.url === '/api/messages') {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', () => {
      const options = {
        hostname: 'api.anthropic.com',
        path: '/v1/messages',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Length': Buffer.byteLength(body)
        }
      };
      const apiReq = https.request(options, apiRes => {
        let data = '';
        apiRes.on('data', d => data += d);
        apiRes.on('end', () => {
          res.writeHead(apiRes.statusCode, {'Content-Type': 'application/json'});
          res.end(data);
        });
      });
      apiReq.on('error', e => {
        res.writeHead(500, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({error: {message: e.message}}));
      });
      apiReq.write(body);
      apiReq.end();
    });
    return;
  }

  res.writeHead(404); res.end('Not found');
});

server.listen(PORT, () => {
  console.log('\x1b[32m✓ Poplatkovy agent bezi na:\x1b[0m http://localhost:' + PORT);
  console.log('  Stisknete Ctrl+C pro ukonceni');
});
