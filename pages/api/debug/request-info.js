export default async function handler(req, res) {
  
  // Try to determine the best IP
  const getClientIP = (req) => {
    return (
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.headers['x-real-ip'] ||
      req.headers['x-client-ip'] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      'Unknown'
    );
  };
  
  const clientIP = getClientIP(req);
  // console.log('\n=== DETERMINED IP ===');
  // console.log('Best guess IP:', clientIP);
  
  // Response with all the data
  res.status(200).json({
    message: 'Request info logged to console',
    detectedIP: clientIP,
    headers: req.headers,
    method: req.method,
    url: req.url,
    userAgent: req.headers['user-agent'],
    language: req.headers['accept-language'],
    referer: req.headers['referer']
  });
} 