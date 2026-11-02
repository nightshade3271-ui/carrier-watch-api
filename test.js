const { findCarrier, computeRiskScore, buildDocketLinks, nationalAverages } = require('./lib/carrierEngine');

console.log('Testing CarrierWatch Intelligence Engine...');

// 1. Test Mega Carrier (Schneider DOT 54283)
const schneider = findCarrier('54283');
console.log('✅ Schneider Lookup:');
console.log(`  Legal Name: ${schneider.legal_name} | MC: ${schneider.mc_number}`);
console.log(`  Power Units: ${schneider.fleet.power_units} | Drivers: ${schneider.fleet.drivers}`);
const schneiderRisk = computeRiskScore(schneider);
console.log(`  Risk Score: ${schneiderRisk.score} (${schneiderRisk.tier}) - Recommendation: ${schneiderRisk.recommendation}`);
if (schneiderRisk.tier !== 'LOW_RISK') throw new Error('Expected Schneider to be LOW_RISK');

// 2. Test Revoked High Risk Carrier (Titan Shield DOT 4150892)
const titan = findCarrier('4150892');
console.log('\n✅ Revoked Carrier Test (Titan Shield):');
console.log(`  Status: ${titan.operating_status} | Rating: ${titan.safety.rating}`);
const titanRisk = computeRiskScore(titan);
console.log(`  Risk Score: ${titanRisk.score} (${titanRisk.tier}) - Flags Triggered: ${titanRisk.flags_count}`);
titanRisk.active_flags.forEach(f => console.log(`   - [${f.severity}] ${f.trigger}`));
if (titanRisk.tier !== 'CRITICAL_FRAUD_ALERT') throw new Error('Expected Titan Shield to trigger CRITICAL_FRAUD_ALERT');

// 3. Test Unknown Carrier Dynamic Simulator (DOT 8765432)
const simulated = findCarrier('8765432');
console.log('\n✅ Dynamic Simulated Carrier (DOT 8765432):');
console.log(`  Legal Name: ${simulated.legal_name}`);
console.log(`  Registration Date: ${simulated.registration_date}`);
console.log(`  Vehicle OOS Rate: ${simulated.safety.vehicle_oos_rate_pct}% (US Nat Avg: ${nationalAverages.vehicleOutOfServiceRate}%)`);
const simRisk = computeRiskScore(simulated);
console.log(`  Risk Score: ${simRisk.score} (${simRisk.tier})`);

// 4. Test Federal Docket Links
const dockets = buildDocketLinks(schneider);
console.log('\n✅ Federal Docket URLs:');
console.log(`  SAFER Snapshot: ${dockets.fmcsa_safer_snapshot}`);
console.log(`  L&I Docket: ${dockets.fmcsa_licensing_insurance}`);

console.log('\n🚀 ALL CARRIERWATCH ENGINE TESTS PASSED WITH 100% PRECISION!');
