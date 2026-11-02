module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  res.status(200).json({
    status: 'ONLINE',
    service: 'CarrierWatch API',
    description: 'Commercial FMCSA Carrier Safety, Insurance & Freight Fraud Intelligence Gateway',
    version: '1.0.0',
    endpoints: [
      'GET /v1/carrier/lookup?dot=54283',
      'GET /v1/carrier/risk-score?dot=54283',
      'GET /v1/carrier/insurance?dot=54283',
      'GET /v1/carrier/safety?dot=54283',
      'GET /v1/carrier/docket?dot=54283',
      'GET /v1/carrier/stats'
    ],
    marketplace: 'https://rapidapi.com/user/rapidapi',
    documentation: 'https://carrier-watch-api.vercel.app'
  });
};
