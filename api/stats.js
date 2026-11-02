const { nationalAverages, insuranceThresholds } = require('../lib/carrierEngine');
const riskRules = require('../lib/data/riskRules.json');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-RapidAPI-Key, X-RapidAPI-Host, X-RapidAPI-Proxy-Secret');

  if (req.method === 'OPTIONS') return res.status(200).end();

  return res.status(200).json({
    success: true,
    service: 'CarrierWatch API — US DOT & FMCSA Safety & Fraud Intelligence',
    version: '1.0.0',
    national_benchmarks: nationalAverages,
    insurance_mandates: insuranceThresholds,
    fraud_risk_indicators: Object.keys(riskRules.riskFlags).map(k => ({
      code: riskRules.riskFlags[k].code,
      severity: riskRules.riskFlags[k].severity,
      description: riskRules.riskFlags[k].description
    }))
  });
};
