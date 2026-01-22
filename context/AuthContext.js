import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Auto-authenticate with a default user ID immediately
  const [user, setUser] = useState({ userId: 'Identity-' + Date.now() });
  const [userInfo, setUserInfo] = useState(null);
  const [countdownSeconds, setCountdownSeconds] = useState(null);

  // Function to parse reset time and extract seconds
  const parseResetTimeSeconds = (resetTime) => {
    if (!resetTime || resetTime === "Unknown" || resetTime.toLowerCase() === "reset") {
      return null;
    }
    // Extract number from strings like "45 seconds"
    const match = resetTime.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  };

  // Function to fetch user info
  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/api/user-info');
      const data = await response.json();
      // Set default reset time to 60 seconds if it's "Reset" or null
      if (data.rateLimit) {
        if (!data.rateLimit.resetTime || 
            data.rateLimit.resetTime === "Unknown" || 
            data.rateLimit.resetTime.toLowerCase() === "reset") {
          data.rateLimit.resetTime = "60 seconds";
        }
      }
      setUserInfo(data);
      // Don't start countdown on initial fetch - only start when API is called
      setCountdownSeconds(null);
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  // Function to update rate limit info directly (called when API is hit)
  const updateRateLimitInfo = (rateLimitInfo) => {
    if (rateLimitInfo) {
      setUserInfo(prev => ({
        ...prev,
        rateLimit: rateLimitInfo
      }));
      // Parse and set countdown seconds - start timer only when we get real TTL from API
      const seconds = parseResetTimeSeconds(rateLimitInfo.resetTime);
      // Only start countdown if we have a valid TTL (not "Reset")
      if (seconds !== null && seconds > 0) {
        setCountdownSeconds(seconds);
      } else {
        setCountdownSeconds(null);
      }
    }
  };

  // Fetch user info on app load
  useEffect(() => {
    fetchUserInfo();
  }, []);

  // Countdown timer for reset time (only starts when API is called)
  useEffect(() => {
    if (countdownSeconds === null || countdownSeconds <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setCountdownSeconds(prev => {
        if (prev === null || prev <= 0) {
          return null;
        }
        const newValue = prev - 1;
        
        // Update userInfo with new countdown value
        setUserInfo(prevInfo => {
          if (!prevInfo || !prevInfo.rateLimit) return prevInfo;
          return {
            ...prevInfo,
            rateLimit: {
              ...prevInfo.rateLimit,
              resetTime: newValue > 0 ? `${newValue} seconds` : 'Reset'
            }
          };
        });
        
        // Return null when it reaches 0 to stop the interval
        return newValue > 0 ? newValue : null;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [countdownSeconds]);

  const generateJWT = async () => {
    try {
      const response = await fetch('/api/auth/magic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ magicNumber: 123 }), // Use a default magic number
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        return { success: true, token: data.token };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setUserInfo(null); // Clear user info on logout
  };

  const getToken = () => {
    return localStorage.getItem('token');
  };

  const value = {
    user,
    userInfo,
    generateJWT,
    logout,
    getToken,
    isAuthenticated: !!user,
    fetchUserInfo,
    updateRateLimitInfo,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 