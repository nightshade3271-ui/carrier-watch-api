const carriers = require('./data/carriers.json');
const riskRules = require('./data/riskRules.json');

/**
 * Normalizes query string (removes 'DOT', 'MC', '#', hyphens, whitespace)
 */
function cleanIdentifier(str) {
  if (!str) return '';
  return str.toString().toUpperCase().replace(/^(USDOT|DOT|MC|FF|MX)[#:\s-]*/i, '').trim();
}

/**
 * Deterministically generates a simulated FMCSA record for unknown DOT numbers
 */
function generateDeterministicCarrier(dot) {
  const num = parseInt(dot.replace(/\D/g, ''), 10) || 1234567;
  const hash = Math.abs(num);
  
  // Registration year derived from DOT number magnitude
  const regYear = num < 500000 ? 1985 + (hash % 15) :
                  num < 2000000 ? 2000 + (hash % 15) :
                  2018 + (hash % 8);
  const regMonth = String(1 + (hash % 12)).padStart(2, '0');
  const regDay = String(1 + (hash % 28)).padStart(2, '0');
  const regDate = `${regYear}-${regMonth}-${regDay}`;

  const isRecent = regYear >= 2025;
  const isRevoked = hash % 17 === 0;
  const isVirtual = hash % 13 === 0;
  
  const states = ['TX', 'CA', 'FL', 'IL', 'OH', 'GA', 'PA', 'NC', 'IN', 'TN'];
  const state = states[hash % states.length];
  
  const powerUnits = (hash % 19) + 1;
  const drivers = (hash % 23 === 0) ? 0 : Math.max(1, powerUnits + ((hash % 5) - 2));

  const vehicleOos = ((hash % 350) / 10).toFixed(1);
  const driverOos = ((hash % 120) / 10).toFixed(1);

  return {
    dot_number: dot,
    mc_number: String(hash % 900000 + 100000),
    legal_name: `TRANS-STATE LOGISTICS CARRIER #${dot}`,
    dba_name: null,
    entity_type: "CARRIER",
    operating_status: isRevoked ? "REVOKED" : "AUTHORIZED_FOR_HIRE",
    authority_type: "COMMON_CONTRACT",
    registration_date: regDate,
    physical_address: {
      street: `${100 + (hash % 9000)} COMMERCE WAY`,
      city: "METROPOLIS",
      state: state,
      zip: String(10000 + (hash % 80000)),
      is_virtual_office: isVirtual
    },
    phone: `(800) ${String(hash % 900 + 100)}-${String(hash % 9000 + 1000)}`,
    fleet: {
      power_units: powerUnits,
      drivers: drivers,
      mileage_annual: powerUnits * 85000,
      mileage_year: 2025
    },
    cargo_carried: ["GENERAL_FREIGHT", "DRY_VAN"],
    safety: {
      rating: isRevoked ? "UNSATISFACTORY" : (hash % 7 === 0 ? "CONDITIONAL" : "UNRATED"),
      rating_date: isRevoked ? "2025-08-14" : null,
      inspections_total_24mo: Math.max(1, Math.floor(powerUnits * 1.5)),
      vehicle_inspections: powerUnits,
      vehicle_oos_inspections: Math.floor(powerUnits * (vehicleOos / 100)),
      vehicle_oos_rate_pct: parseFloat(vehicleOos),
      driver_inspections: drivers * 2,
      driver_oos_inspections: Math.floor(drivers * 2 * (driverOos / 100)),
      driver_oos_rate_pct: parseFloat(driverOos),
      hazmat_inspections: 0,
      hazmat_oos_rate_pct: 0,
      crashes_total_24mo: hash % 4,
      crashes_fatal: 0,
      crashes_injury: hash % 2,
      crashes_towaway: hash % 3
    },
    insurance: {
      bipd_required_usd: 750000,
      bipd_on_file_usd: isRevoked ? 0 : 1000000,
      bipd_carrier: isRevoked ? "CANCELLED" : "NATIONAL TRUCK UNDERWRITERS",
      bipd_policy_number: `NTU-${hash % 8000000 + 1000000}`,
      bipd_effective_date: `${regYear}-01-15`,
      cargo_required: false,
      cargo_on_file_usd: 100000,
      cargo_carrier: "PROGRESSIVE FREIGHT",
      bond_on_file_usd: 0,
      has_pending_cancellation: isRevoked
    }
  };
}

/**
 * Look up carrier by DOT, MC, or Company Name
 */
function findCarrier(query) {
  if (!query) return null;
  const cleanQ = cleanIdentifier(query);

  // 1. Direct match in local catalog
  const found = carriers.find(c => 
    c.dot_number === cleanQ ||
    c.mc_number === cleanQ ||
    (c.legal_name && c.legal_name.toLowerCase().includes(query.toLowerCase())) ||
    (c.dba_name && c.dba_name.toLowerCase().includes(query.toLowerCase()))
  );

  if (found) return found;

  // 2. If it's a numeric DOT query, return simulated real-world record
  if (/^\d{4,8}$/.test(cleanQ)) {
    return generateDeterministicCarrier(cleanQ);
  }

  return null;
}

/**
 * Calculates proprietary CarrierWatch Fraud & Risk Score (0-100)
 */
function computeRiskScore(carrier) {
  let score = 0;
  const activeFlags = [];
  const rules = riskRules.riskFlags;
  const natAvg = riskRules.nationalAverages;

  // 1. Authority Status
  if (carrier.operating_status === "REVOKED" || carrier.operating_status === "INACTIVE") {
    score += rules.AUTHORITY_REVOKED.penalty;
    activeFlags.push({ ...rules.AUTHORITY_REVOKED, trigger: `Operating status is ${carrier.operating_status}` });
  }

  // 2. Registration Age / Chameleon Risk
  const regDate = new Date(carrier.registration_date);
  const now = new Date('2026-11-02');
  const ageDays = Math.floor((now - regDate) / (1000 * 60 * 60 * 24));

  if (ageDays >= 0 && ageDays < 90) {
    score += rules.CHAMELEON_CARRIER_AGE.penalty;
    activeFlags.push({ ...rules.CHAMELEON_CARRIER_AGE, trigger: `Carrier registered ${ageDays} days ago (<90 days)` });
  } else if (ageDays >= 90 && ageDays < 180) {
    score += rules.CHAMELEON_CARRIER_AGE_180.penalty;
    activeFlags.push({ ...rules.CHAMELEON_CARRIER_AGE_180, trigger: `Carrier registered ${ageDays} days ago (<180 days)` });
  }

  // 3. Insurance Coverage & Pending Cancellation
  if (carrier.insurance.has_pending_cancellation || carrier.insurance.bipd_on_file_usd < carrier.insurance.bipd_required_usd) {
    score += rules.INSURANCE_LAPSE.penalty;
    activeFlags.push({
      ...rules.INSURANCE_LAPSE,
      trigger: carrier.insurance.has_pending_cancellation ? "Pending cancellation notice on file" : "BIPD insurance on file ($0) is below statutory required ($750,000)"
    });
  }

  // 4. Vehicle Out-of-Service Rate
  if (carrier.safety.vehicle_oos_rate_pct > natAvg.vehicleOutOfServiceRate) {
    score += rules.HIGH_VEHICLE_OOS.penalty;
    activeFlags.push({
      ...rules.HIGH_VEHICLE_OOS,
      trigger: `Vehicle OOS rate ${carrier.safety.vehicle_oos_rate_pct}% exceeds US average (${natAvg.vehicleOutOfServiceRate}%)`
    });
  }

  // 5. Driver Out-of-Service Rate
  if (carrier.safety.driver_oos_rate_pct > natAvg.driverOutOfServiceRate) {
    score += rules.HIGH_DRIVER_OOS.penalty;
    activeFlags.push({
      ...rules.HIGH_DRIVER_OOS,
      trigger: `Driver OOS rate ${carrier.safety.driver_oos_rate_pct}% exceeds US average (${natAvg.driverOutOfServiceRate}%)`
    });
  }

  // 6. Safety Rating
  if (carrier.safety.rating === "UNSATISFACTORY") {
    score += rules.UNSATISFACTORY_SAFETY_RATING.penalty;
    activeFlags.push({ ...rules.UNSATISFACTORY_SAFETY_RATING, trigger: "FMCSA Unsatisfactory Safety Rating" });
  } else if (carrier.safety.rating === "CONDITIONAL") {
    score += rules.CONDITIONAL_SAFETY_RATING.penalty;
    activeFlags.push({ ...rules.CONDITIONAL_SAFETY_RATING, trigger: "FMCSA Conditional Safety Rating" });
  }

  // 7. Power Units vs Drivers Mismatch
  if (carrier.fleet.power_units > 0 && carrier.fleet.drivers === 0) {
    score += rules.FLEET_DRIVER_MISMATCH.penalty;
    activeFlags.push({ ...rules.FLEET_DRIVER_MISMATCH, trigger: `${carrier.fleet.power_units} trucks reported with 0 commercial drivers` });
  }

  // 8. Virtual Mailbox Office
  if (carrier.physical_address.is_virtual_office) {
    score += rules.VIRTUAL_ADDRESS_DETECTED.penalty;
    activeFlags.push({ ...rules.VIRTUAL_ADDRESS_DETECTED, trigger: `Terminal address flagged as mail forwarding/virtual office: ${carrier.physical_address.street}` });
  }

  // Cap at 100
  score = Math.min(100, score);

  let riskTier = "LOW_RISK";
  let dispatchRecommendation = "CLEARED_FOR_DISPATCH";
  let badgeColor = "#10b981"; // Emerald

  if (score >= 60) {
    riskTier = "CRITICAL_FRAUD_ALERT";
    dispatchRecommendation = "DO_NOT_DISPATCH__CRITICAL_RISK";
    badgeColor = "#ef4444"; // Red
  } else if (score >= 35) {
    riskTier = "ELEVATED_RISK";
    dispatchRecommendation = "SUPERVISOR_APPROVAL_REQUIRED";
    badgeColor = "#f59e0b"; // Amber
  } else if (score > 15) {
    riskTier = "MODERATE_RISK";
    dispatchRecommendation = "CAUTION__EXTRA_VETTING_SUGGESTED";
    badgeColor = "#3b82f6"; // Blue
  }

  return {
    score: score,
    tier: riskTier,
    recommendation: dispatchRecommendation,
    badge_color: badgeColor,
    flags_count: activeFlags.length,
    active_flags: activeFlags,
    operating_age_days: ageDays,
    compliance_audit: {
      is_authorized: carrier.operating_status === "AUTHORIZED_FOR_HIRE",
      has_valid_insurance: !carrier.insurance.has_pending_cancellation && carrier.insurance.bipd_on_file_usd >= carrier.insurance.bipd_required_usd,
      passed_oos_benchmarks: carrier.safety.vehicle_oos_rate_pct <= natAvg.vehicleOutOfServiceRate && carrier.safety.driver_oos_rate_pct <= natAvg.driverOutOfServiceRate
    }
  };
}

/**
 * Builds direct federal verification links (SAFER, SMS, Licensing & Insurance)
 */
function buildDocketLinks(carrier) {
  const dot = carrier.dot_number;
  const mc = carrier.mc_number;

  return {
    fmcsa_safer_snapshot: `https://safer.fmcsa.dot.gov/query.asp?searchtype=ANY&query_type=queryCarrierSnapshot&query_param=USDOT&query_string=${dot}`,
    fmcsa_sms_safety: `https://ai.fmcsa.dot.gov/SMS/Carrier/${dot}/Overview.aspx`,
    fmcsa_licensing_insurance: mc ? `https://li-public.fmcsa.dot.gov/viewer/v_docket?pv_ap_id=&pv_v_docket=MC${mc}&pv_legal_name=&pv_pref_docket=` : null,
    direct_dot_query: `https://carrier-watch-api.vercel.app/v1/carrier/lookup?dot=${dot}`
  };
}

module.exports = {
  findCarrier,
  computeRiskScore,
  buildDocketLinks,
  nationalAverages: riskRules.nationalAverages,
  insuranceThresholds: riskRules.insuranceThresholds
};

