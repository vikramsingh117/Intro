export default async function handler(req, res) {
  // Get IP address
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

  // Parse User Agent for OS and Browser info
  const parseUserAgent = (userAgent) => {
    if (!userAgent) return { os: 'Unknown', browser: 'Unknown' };

    // OS Detection
    let os = 'Unknown';
    if (userAgent.includes('Windows NT 10.0')) os = 'Windows 10';
    else if (userAgent.includes('Windows NT 6.3')) os = 'Windows 8.1';
    else if (userAgent.includes('Windows NT 6.1')) os = 'Windows 7';
    else if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac OS X')) {
      const macMatch = userAgent.match(/Mac OS X ([\d_]+)/);
      os = macMatch ? `macOS ${macMatch[1].replace(/_/g, '.')}` : 'macOS';
    }
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) {
      const androidMatch = userAgent.match(/Android ([\d.]+)/);
      os = androidMatch ? `Android ${androidMatch[1]}` : 'Android';
    }
    else if (userAgent.includes('iPhone OS')) {
      const iosMatch = userAgent.match(/iPhone OS ([\d_]+)/);
      os = iosMatch ? `iOS ${iosMatch[1].replace(/_/g, '.')}` : 'iOS';
    }

    // Browser Detection
    let browser = 'Unknown';
    if (userAgent.includes('Chrome') && !userAgent.includes('Chromium')) {
      const chromeMatch = userAgent.match(/Chrome\/([\d.]+)/);
      browser = chromeMatch ? `Chrome ${chromeMatch[1]}` : 'Chrome';
    }
    else if (userAgent.includes('Firefox')) {
      const firefoxMatch = userAgent.match(/Firefox\/([\d.]+)/);
      browser = firefoxMatch ? `Firefox ${firefoxMatch[1]}` : 'Firefox';
    }
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      const safariMatch = userAgent.match(/Version\/([\d.]+)/);
      browser = safariMatch ? `Safari ${safariMatch[1]}` : 'Safari';
    }
    else if (userAgent.includes('Edge')) {
      const edgeMatch = userAgent.match(/Edge\/([\d.]+)/);
      browser = edgeMatch ? `Edge ${edgeMatch[1]}` : 'Edge';
    }

    return { os, browser };
  };

  // Get location data from IP using ipwho.is
  const getLocationFromIP = async (ip) => {
    try {
      // Skip location lookup for localhost or private IPs
      if (ip === 'Unknown' || ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('10.')) {
        return {
          country: 'Unknown',
          region: 'Unknown', 
          city: 'Unknown',
          timezone: 'Unknown'
        };
      }

      const response = await fetch(`https://ipwho.is/${ip}`);
      const locationData = await response.json();

      if (locationData.success) {
        return {
          country: locationData.country || 'Unknown',
          region: locationData.region || 'Unknown',
          city: locationData.city || 'Unknown',
          timezone: locationData.timezone?.id || 'Unknown'
        };
      } else {
        return {
          country: 'Unknown',
          region: 'Unknown',
          city: 'Unknown', 
          timezone: 'Unknown'
        };
      }
    } catch (error) {
      console.error('Error fetching location data:', error);
      return {
        country: 'Unknown',
        region: 'Unknown',
        city: 'Unknown',
        timezone: 'Unknown'
      };
    }
  };

  const clientIP = getClientIP(req);
  const userAgent = req.headers['user-agent'];
  const { os, browser } = parseUserAgent(userAgent);
  const location = await getLocationFromIP(clientIP);

  res.status(200).json({
    ip: clientIP,
    os: os,
    browser: browser,
    country: location.country,
    region: location.region,
    city: location.city,
    timezone: location.timezone,
    userAgent: userAgent
  });
} 