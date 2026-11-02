const { findCarrier, computeRiskScore, buildDocketLinks } = require('../lib/carrierEngine');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const query = req.query.dot || req.query.query || '54283';
  const carrier = findCarrier(query);

  if (!carrier) {
    return res.status(404).json({ success: false, error: `Carrier '${query}' not found.` });
  }

  const risk = computeRiskScore(carrier);
  const dockets = buildDocketLinks(carrier);

  return res.status(200).json({
    success: true,
    carrier,
    risk_assessment: risk,
    federal_dockets: dockets
  });
};

