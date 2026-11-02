const { findCarrier, computeRiskScore, buildDocketLinks } = require('../lib/carrierEngine');
const { validateRapidApiRequest } = require('../lib/auth');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-RapidAPI-Key, X-RapidAPI-Host, X-RapidAPI-Proxy-Secret');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  if (!validateRapidApiRequest(req)) {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'Unauthorized: Invalid RapidAPI Proxy Secret' }));
  }

  const q = req.query || {};
  const query = q.dot || q.mc || q.query || q.name;

  if (!query) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      success: false,
      error: 'Missing required query parameter. Provide ?dot=54283, ?mc=135684, or ?name=Schneider'
    }));
  }

  const carrier = findCarrier(query);

  if (!carrier) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      success: false,
      error: `No motor carrier found matching query '${query}'. Ensure valid 5-8 digit USDOT or MC number.`
    }));
  }

  const risk = computeRiskScore(carrier);
  const dockets = buildDocketLinks(carrier);

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify({
    success: true,
    carrier: carrier,
    risk_assessment: risk,
    federal_dockets: dockets
  }, null, 2));
};
