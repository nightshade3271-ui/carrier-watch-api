const { findCarrier, computeRiskScore } = require('../lib/carrierEngine');
const { validateRapidApiRequest } = require('../lib/auth');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-RapidAPI-Key, X-RapidAPI-Host, X-RapidAPI-Proxy-Secret');

  if (req.method === 'OPTIONS') { res.statusCode = 204; return res.end(); }
  if (!validateRapidApiRequest(req)) {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'Unauthorized' }));
  }

  const q = req.query || {};
  const query = q.dot || q.mc || q.query;
  if (!query) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ success: false, error: 'Provide ?dot=54283 or ?mc=135684' }));
  }

  const carrier = findCarrier(query);
  if (!carrier) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ success: false, error: `Carrier '${query}' not found.` }));
  }

  const risk = computeRiskScore(carrier);

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify({
    success: true,
    dot_number: carrier.dot_number,
    mc_number: carrier.mc_number,
    legal_name: carrier.legal_name,
    operating_status: carrier.operating_status,
    risk_assessment: risk
  }, null, 2));
};
