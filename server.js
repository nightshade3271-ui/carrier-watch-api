const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const lookupHandler = require('./api/lookup');
const riskHandler = require('./api/risk');
const insuranceHandler = require('./api/insurance');
const safetyHandler = require('./api/safety');
const docketHandler = require('./api/docket');
const statsHandler = require('./api/stats');
const sandboxHandler = require('./api/sandbox');
const indexHandler = require('./api/index');

const PORT = process.env.PORT || 3010;

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  req.query = parsed.query;
  let pathname = parsed.pathname || '/';
  
  // Normalize trailing slash (except root '/')
  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }

  // API Routes
  if (pathname === '/v1/carrier/lookup' || pathname === '/api/lookup') return lookupHandler(req, res);
  if (pathname === '/v1/carrier/risk-score' || pathname === '/api/risk') return riskHandler(req, res);
  if (pathname === '/v1/carrier/insurance' || pathname === '/api/insurance') return insuranceHandler(req, res);
  if (pathname === '/v1/carrier/safety' || pathname === '/api/safety') return safetyHandler(req, res);
  if (pathname === '/v1/carrier/docket' || pathname === '/api/docket') return docketHandler(req, res);
  if (pathname === '/v1/carrier/stats' || pathname === '/api/stats') return statsHandler(req, res);
  if (pathname === '/api/sandbox') return sandboxHandler(req, res);
  if (pathname === '/v1/status' || pathname === '/api/index' || pathname === '/status') return indexHandler(req, res);

  // Serve static files from public/
  let filePath = path.join(__dirname, 'public', pathname === '/' ? 'index.html' : pathname);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml'
    };
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  // Fallback 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found', path: pathname }));
});

server.listen(PORT, () => {
  console.log(`CarrierWatch API server running at http://localhost:${PORT}`);
});
