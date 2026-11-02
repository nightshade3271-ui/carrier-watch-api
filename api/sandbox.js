const { findCarrier, computeRiskScore, buildDocketLinks } = require('../lib/carrierEngine');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.statusCode = 204; return res.end(); }

  const q = req.query || {};
  const query = q.dot || q.query || '54283';
  const carrier = findCarrier(query);

  if (!carrier) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ success: false, error: `Carrier '${query}' not found.` }));
  }

  const risk = computeRiskScore(carrier);
  const dockets = buildDocketLinks(carrier);

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify({
    success: true,
    carrier,
    risk_assessment: risk,
    federal_dockets: dockets
  }, null, 2));
};
