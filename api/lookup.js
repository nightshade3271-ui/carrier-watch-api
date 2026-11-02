const { findCarrier, computeRiskScore, buildDocketLinks } = require('../lib/carrierEngine');
const { validateRapidApiRequest } = require('../lib/auth');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-RapidAPI-Key, X-RapidAPI-Host, X-RapidAPI-Proxy-Secret');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!validateRapidApiRequest(req)) {
    return res.status(403).json({ error: 'Unauthorized: Invalid RapidAPI Proxy Secret' });
  }

  const query = req.query.dot || req.query.mc || req.query.query || req.query.name;

  if (!query) {
    return res.status(400).json({
      success: false,
      error: 'Missing required query parameter. Provide ?dot=54283, ?mc=135684, or ?name=Schneider'
    });
  }

  const carrier = findCarrier(query);

  if (!carrier) {
    return res.status(404).json({
      success: false,
      error: `No motor carrier found matching query '${query}'. Ensure valid 5-8 digit USDOT or MC number.`
    });
  }

  const risk = computeRiskScore(carrier);
  const dockets = buildDocketLinks(carrier);

  return res.status(200).json({
    success: true,
    carrier: carrier,
    risk_assessment: risk,
    federal_dockets: dockets
  });
};

