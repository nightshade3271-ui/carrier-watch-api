const { findCarrier, computeRiskScore } = require('../lib/carrierEngine');
const { validateRapidApiRequest } = require('../lib/auth');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-RapidAPI-Key, X-RapidAPI-Host, X-RapidAPI-Proxy-Secret');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!validateRapidApiRequest(req)) return res.status(403).json({ error: 'Unauthorized' });

  const query = req.query.dot || req.query.mc || req.query.query;
  if (!query) {
    return res.status(400).json({ success: false, error: 'Provide ?dot=54283 or ?mc=135684' });
  }

  const carrier = findCarrier(query);
  if (!carrier) {
    return res.status(404).json({ success: false, error: `Carrier '${query}' not found.` });
  }

  const risk = computeRiskScore(carrier);

  return res.status(200).json({
    success: true,
    dot_number: carrier.dot_number,
    mc_number: carrier.mc_number,
    legal_name: carrier.legal_name,
    operating_status: carrier.operating_status,
    risk_assessment: risk
  });
};
