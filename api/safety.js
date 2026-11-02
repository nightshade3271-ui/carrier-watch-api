const { findCarrier, nationalAverages } = require('../lib/carrierEngine');
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

  const s = carrier.safety;

  return res.status(200).json({
    success: true,
    dot_number: carrier.dot_number,
    mc_number: carrier.mc_number,
    legal_name: carrier.legal_name,
    safety_overview: {
      rating: s.rating,
      rating_date: s.rating_date,
      fleet: carrier.fleet,
      inspections_24mo: {
        total: s.inspections_total_24mo,
        vehicle: {
          inspections: s.vehicle_inspections,
          oos_count: s.vehicle_oos_inspections,
          oos_rate_pct: s.vehicle_oos_rate_pct,
          national_average_pct: nationalAverages.vehicleOutOfServiceRate,
          exceeds_national_average: s.vehicle_oos_rate_pct > nationalAverages.vehicleOutOfServiceRate
        },
        driver: {
          inspections: s.driver_inspections,
          oos_count: s.driver_oos_inspections,
          oos_rate_pct: s.driver_oos_rate_pct,
          national_average_pct: nationalAverages.driverOutOfServiceRate,
          exceeds_national_average: s.driver_oos_rate_pct > nationalAverages.driverOutOfServiceRate
        }
      },
      crashes_24mo: {
        total: s.crashes_total_24mo,
        fatal: s.crashes_fatal,
        injury: s.crashes_injury,
        towaway: s.crashes_towaway
      }
    }
  });
};

