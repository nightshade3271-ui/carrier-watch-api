# CarrierWatch API — RapidAPI Marketplace Listing Dossier

> **Ready-to-Deploy Listing Sheet for RapidAPI Studio**  
> Primary Category: **Logistics** or **Business** *(Secondary: Data, Tools)*  
> Production Gateway: `https://carrier-watch-api.vercel.app`

---

## 1. Core Metadata

- **API Name:** `CarrierWatch API`
- **Short Tagline:** US DOT & FMCSA Carrier Safety, Insurance & Freight Fraud API.
- **Category:** `Logistics` (or `Business` / `Data`)
- **Primary Website:** `https://carrier-watch-api.vercel.app`
- **Terms of Service URL:** `https://carrier-watch-api.vercel.app/terms`
- **OpenAPI 3.0 File:** Upload [`rapidapi-openapi.json`](file:///c:/Users/jewel/Desktop/Tink/carrier-watch-api/rapidapi-openapi.json)
- **API Logo:** [`logo.svg`](file:///c:/Users/jewel/Desktop/Tink/carrier-watch-api/logo.svg) or [`public/logo.svg`](file:///c:/Users/jewel/Desktop/Tink/carrier-watch-api/public/logo.svg)

---

## 2. Short Description
> Instant USDOT & MC carrier verification, FMCSA SAFER safety ratings, $750k/$1M commercial auto insurance audits, and automated double-brokering fraud risk scoring for freight brokers and 3PLs.

---

## 3. Long Description (Clean Text for RapidAPI Editor)

```text
🚚 CarrierWatch API — Automated FMCSA Carrier Due Diligence & Fraud Defense

CarrierWatch API delivers enterprise-grade motor carrier verification and freight fraud detection for freight brokerages, 3PLs, shippers, factoring companies, and TMS software platforms.

With freight fraud, identity theft, and double-brokering at an all-time high, manual vetting on government websites slows down dispatchers and exposes brokerages to catastrophic cargo liability. CarrierWatch unifies federal FMCSA SAFER, Safety Measurement System (SMS), and Licensing & Insurance (L&I) dockets into one sub-50ms REST API.

═══════════════════════════════════════════
🌟 KEY CAPABILITIES
═══════════════════════════════════════════

1. 🛡️ Proprietary Fraud & Chameleon Risk Scoring (0–100)
• Automatically flags "Chameleon Carriers" (<90 days old) attempting to re-incorporate after fatal crashes or safety shutdowns.
• Detects virtual office and commercial mailbox addresses (UPS Store, Regus, Regus Way) masquerading as physical trucking yards.
• Identifies severe fleet/driver mismatches (e.g. 5 power units with 0 commercial drivers on file).
• Instant dispatch verdicts: CLEARED_FOR_DISPATCH, SUPERVISOR_APPROVAL_REQUIRED, or DO_NOT_DISPATCH.

2. 📋 Comprehensive Insurance Compliance Audit
• Verifies statutory Commercial Auto Bodily Injury & Property Damage (BIPD) coverage ($750,000 to $1,000,000 minimum).
• Audits active cargo insurance policies ($100,000 industry standard).
• Checks $75,000 BMC-84 broker surety bonds.
• Instantly warns if an underwriter has posted a PENDING CANCELLATION notice on file with FMCSA.

3. ⚠️ Safety Ratings & Inspection Out-of-Service (OOS) Benchmarks
• Retrieves 24-month total inspection counts and official safety rating (Satisfactory, Conditional, Unsatisfactory, Unrated).
• Vehicle Out-of-Service Rate benchmarked against the US national average (22.26%).
• Driver Out-of-Service Rate benchmarked against the US national average (6.67%).
• 24-month crash history broken down into fatal, injury, and towaway incidents.

4. 🏛️ Official Federal Docket Deep Links
• Direct 1-click links to FMCSA SAFER Company Snapshot.
• Direct links to Safety Measurement System (SMS) BASIC percentiles.
• Direct links to FMCSA Licensing & Insurance (L&I) public docket.

═══════════════════════════════════════════
🚀 COMMON USE CASES
═══════════════════════════════════════════

• Freight Brokerage Onboarding: Automate carrier packet vetting and block unrated, revoked, or high-risk carriers before signing rate confirmations.
• TMS Integration: Run automated background checks every time a dispatcher assigns a carrier to a load.
• Freight Factoring Platforms: Verify debtor authority and active insurance before purchasing freight invoices.
• Load Boards & Shippers: Screen carrier directories to maintain zero-tolerance safety and compliance standards.

═══════════════════════════════════════════
⚡ ENDPOINTS OVERVIEW
═══════════════════════════════════════════

• GET /v1/carrier/lookup — Full carrier profile, safety audit, risk score, and dockets (?dot=54283 or ?mc=135684)
• GET /v1/carrier/risk-score — 0-100 fraud score, chameleon risk, and dispatch recommendation (?dot=54283)
• GET /v1/carrier/insurance — BIPD, cargo, and pending insurance cancellation audit (?dot=54283)
• GET /v1/carrier/safety — 24-month inspections, crash records, and vehicle/driver OOS comparison (?dot=54283)
• GET /v1/carrier/docket — 1-click official SAFER, SMS, and L&I government links (?dot=54283)
• GET /v1/carrier/stats — US national safety averages and active fraud rule registry
```

---

## 4. Monetization & Pricing Tiers

Configure these 4 tiers in RapidAPI Studio -> **Monetization**:

| Tier Name | Price | Requests / Month | Overage Rate | Rate Limit |
|---|---|---|---|---|
| **BASIC (Free)** | **$0.00 / mo** | **50 checks** | Hard limit (no overage) | 5 req / sec |
| **PRO (Dispatcher)** | **$29.00 / mo** | **1,000 checks** | $0.03 / check | 15 req / sec |
| **ULTRA (Brokerage)** | **$79.00 / mo** | **5,000 checks** | $0.015 / check | 30 req / sec |
| **MEGA (Enterprise)** | **$199.00 / mo** | **25,000 checks** | $0.008 / check | 60 req / sec |

---

## 5. Terms of Use (Clean Text)

```text
CarrierWatch API Terms of Service & License Agreement

1. Permitted Use: Subscribers are granted a commercial, non-exclusive license to query CarrierWatch API for carrier vetting, load tendering, insurance verification, and freight fraud prevention within their applications.
2. Fair Use: Reselling raw API responses as a competing standalone lookup service is prohibited. RapidAPI authentication headers must be maintained.
3. Data Disclaimer: Carrier safety, insurance, and operating status metrics are compiled from federal FMCSA and USDOT public safety dockets and proprietary risk models. Users are encouraged to verify final insurance certificates directly with underwriters for high-value cargo.
4. Uptime & Support: Operates on high-availability serverless infrastructure with 99.9% uptime SLA.
```

