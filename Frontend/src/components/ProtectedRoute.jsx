import React, { useState, useEffect } from 'react';
import checkAuth from '../services/AuthService';
import useTokenRefresh from './TokenRefresh';
import Navigate from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  useTokenRefresh();

  useEffect(() => {
    const checkAuthentication = async () => {
      const authStatus = await checkAuth();
      setIsAuthenticated(authStatus);
    };
    checkAuthentication();
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;