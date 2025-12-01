import { getRedisClient, isRedisAvailable } from './backend/redis';

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

  // Parse User Agent for OS, Device Type and Browser info
  const parseUserAgent = (userAgent) => {
    if (!userAgent) return { os: 'Unknown', deviceType: 'Unknown', browser: 'Unknown' };

    // Device Type Detection
    let deviceType = 'Desktop';
    if (userAgent.includes('Mobile') && !userAgent.includes('Tablet')) {
      deviceType = 'Mobile';
    } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
      deviceType = 'Tablet';
    }

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

    return { os, deviceType, browser };
  };

  // Get location data from IP using ipwho.is
  const getLocationFromIP = async (ip) => {
    try {
      // Skip location lookup for localhost or private IPs
      if (ip === 'Unknown' || ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('10.')) {
        return {
          state: 'Unknown',
          postalCode: 'Unknown',
          latitude: null,
          longitude: null
        };
      }

      const response = await fetch(`https://ipwho.is/${ip}`);
      const locationData = await response.json();

      if (locationData.success) {
        return {
          state: locationData.region || 'Unknown',
          postalCode: locationData.postal || 'Unknown',
          latitude: locationData.latitude || null,
          longitude: locationData.longitude || null,
          city: locationData.city || 'Unknown'
        };
      } else {
        return {
          state: 'Unknown',
          postalCode: 'Unknown',
          latitude: null,
          longitude: null,
          city: 'Unknown'
        };
      }
    } catch (error) {
      console.error('Error fetching location data:', error);
      return {
        state: 'Unknown',
        postalCode: 'Unknown',
        latitude: null,
        longitude: null,
        city: 'Unknown'
      };
    }
  };

  // Get temperature from weather API
  // Get temperature from Open-Meteo using latitude & longitude
const getTemperature = async (lat, lon) => {
  try {
    if (!lat || !lon) return 'Unknown';

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;

    const res = await fetch(url, { headers: { "User-Agent": "node" } });
    const data = await res.json();
    // console.log("Weather API response:", data);
    const temp = data?.current_weather?.temperature;
    if (temp === undefined || temp === null) return 'Unknown';

    return `${temp}°C`;
  } catch (error) {
    console.error("Error fetching temperature:", error);
    return "Unknown";
  }
};


  // Get edge server info from Vercel headers
  const getEdgeInfo = (req) => {
    // Try various Vercel headers to get edge/region info
    const vercelRegion = req.headers['x-vercel-id'];
    const vercelDeploymentUrl = req.headers['x-vercel-deployment-url']; 
    const vercelCache = req.headers['x-vercel-cache'];
    const vercelEdge = req.headers['x-vercel-edge-region'];
    
    // Extract region from x-vercel-id (format: region-randomstring)
    let region = 'Unknown';
    if (vercelRegion) {
      const regionCode = vercelRegion.split('-')[0];
      region = regionCode ? regionCode.toUpperCase() : 'Unknown';
    }
    
    // Return the most useful info we can get
    return {
      region: region,
      deploymentUrl: vercelDeploymentUrl || 'Unknown',
      cache: vercelCache || 'Unknown',
      edgeRegion: vercelEdge || 'Unknown'
    };
  };

  // Get rate limit info
  const getRateLimitInfo = async () => {
    try {
      const redisAvailable = await isRedisAvailable();
      if (!redisAvailable) {
        return { requestsUsed: 'Unknown', requestsRemaining: 'Unknown', resetTime: 'Unknown' };
      }

      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      const key = `rate_limit:${ip}`;
      
      const redis = await getRedisClient();
      let currentCount = await redis.get(key);
      currentCount = currentCount ? parseInt(currentCount, 10) : 0;
      
      const ttl = await redis.ttl(key);
      
      return {
        requestsUsed: currentCount,
        requestsRemaining: Math.max(0, 15 - currentCount),
        resetTime: ttl > 0 ? `${ttl} seconds` : 'Reset'
      };
    } catch (error) {
      console.error('Error getting rate limit info:', error);
      return { requestsUsed: 'Error', requestsRemaining: 'Error', resetTime: 'Error' };
    }
  };

  const clientIP = getClientIP(req);
  const userAgent = req.headers['user-agent'];
  const { os, deviceType, browser } = parseUserAgent(userAgent);
  // console.log('Client IP:', clientIP);
  console.log(1);
  const location = await getLocationFromIP(clientIP);
  // console.log('Location Data:', location);
  console.log(2);
const temperature = await getTemperature(location.latitude, location.longitude);
  // console.log('Temperature Data:', temperature);
  console.log(3);
  const edgeInfo = getEdgeInfo(req);
  // console.log('Edge Info:', edgeInfo);
  console.log(4);
  const rateLimitInfo = await getRateLimitInfo();
  console.log(5);
  // console.log('Rate Limit Info:', rateLimitInfo);
  res.status(200).json({
    ip: clientIP,
    latitude: location.latitude,
    longitude: location.longitude,
    os: `${os} (${deviceType})`,
    browser: browser,
    state: location.state,
    postalCode: location.postalCode,
    temperature: temperature,
    edgeServer: edgeInfo.region,
    rateLimit: rateLimitInfo
  });
} 