const http = require('http');
const url = require('url');

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
  const pathname = parsed.pathname;

  if (pathname === '/v1/carrier/lookup') return lookupHandler(req, res);
  if (pathname === '/v1/carrier/risk-score') return riskHandler(req, res);
  if (pathname === '/v1/carrier/insurance') return insuranceHandler(req, res);
  if (pathname === '/v1/carrier/safety') return safetyHandler(req, res);
  if (pathname === '/v1/carrier/docket') return docketHandler(req, res);
  if (pathname === '/v1/carrier/stats') return statsHandler(req, res);
  if (pathname === '/api/sandbox') return sandboxHandler(req, res);
  if (pathname === '/v1/status' || pathname === '/api/index') return indexHandler(req, res);

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

server.listen(PORT, () => {
  console.log(`CarrierWatch API local server running at http://localhost:${PORT}`);
});
