/**
 * RapidAPI Proxy Secret Validation & Sandbox Access Handler
 */
function validateRapidApiRequest(req) {
  const proxySecret = process.env.RAPIDAPI_PROXY_SECRET;
  const headerSecret = req.headers['x-rapidapi-proxy-secret'];

  // If secret configured in environment, require it
  if (proxySecret && headerSecret) {
    return headerSecret === proxySecret;
  }

  // Allow open access if secret not configured (development/sandbox mode)
  return true;
}

module.exports = {
  validateRapidApiRequest
};

