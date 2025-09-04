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
  const [user, setUser] = useState({ userId: 'auto-user-' + Date.now() });
  const [userInfo, setUserInfo] = useState(null);

  // Function to fetch user info
  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/api/user-info');
      const data = await response.json();
      setUserInfo(data);
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  // Fetch user info on app load
  useEffect(() => {
    fetchUserInfo();
  }, []);

  const generateJWT = async (magicNumber) => {
    try {
      const response = await fetch('/api/auth/magic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ magicNumber: parseInt(magicNumber) }),
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
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 