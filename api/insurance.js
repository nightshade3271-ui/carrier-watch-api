const { findCarrier, insuranceThresholds } = require('../lib/carrierEngine');
const { validateRapidApiRequest } = require('../lib/auth');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-RapidAPI-Key, X-RapidAPI-Host, X-RapidAPI-Proxy-Secret');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!validateRapidApiRequest(req)) return res.status(403).json({ error: 'Unauthorized' });

  const query = req.query.dot || req.query.mc || req.query.query;
  if (!query) return res.status(400).json({ success: false, error: 'Provide ?dot=54283 or ?mc=135684' });

  const carrier = findCarrier(query);
  if (!carrier) return res.status(404).json({ success: false, error: `Carrier '${query}' not found.` });

  const ins = carrier.insurance;
  const isCompliant = !ins.has_pending_cancellation && ins.bipd_on_file_usd >= ins.bipd_required_usd;

  return res.status(200).json({
    success: true,
    dot_number: carrier.dot_number,
    mc_number: carrier.mc_number,
    legal_name: carrier.legal_name,
    insurance_audit: {
      is_compliant: isCompliant,
      bipd_coverage: {
        status: ins.bipd_on_file_usd >= ins.bipd_required_usd ? 'ACTIVE' : 'DEFICIENT',
        amount_usd: ins.bipd_on_file_usd,
        required_usd: ins.bipd_required_usd,
        underwriter: ins.bipd_carrier,
        policy_number: ins.bipd_policy_number,
        effective_date: ins.bipd_effective_date
      },
      cargo_coverage: {
        status: ins.cargo_on_file_usd >= insuranceThresholds.industryStandardCargo ? 'VERIFIED' : 'BELOW_STANDARD',
        amount_usd: ins.cargo_on_file_usd,
        underwriter: ins.cargo_carrier
      },
      broker_bond_bmc84: {
        status: ins.bond_on_file_usd >= insuranceThresholds.standardBrokerBondBMC84 ? 'ACTIVE' : 'NOT_APPLICABLE',
        amount_usd: ins.bond_on_file_usd
      },
      has_pending_cancellation: ins.has_pending_cancellation,
      dispatch_verdict: isCompliant ? 'INSURANCE_VERIFIED__SAFE_TO_LOAD' : 'INSURANCE_FAILED__DO_NOT_LOAD'
    }
  });
};
