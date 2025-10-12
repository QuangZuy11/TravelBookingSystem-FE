import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const navigate = useNavigate();

  useEffect(() => {
    // Check token and other stored data
    const token = localStorage.getItem('token');
    const fullName = localStorage.getItem('fullName');
    const providerId = localStorage.getItem('providerId');
    const role = localStorage.getItem('role');
    const providerStr = localStorage.getItem('provider');

    // If we have a token and basic user info, restore the user state
    if (token && fullName) {
      const restoredUser = {
        name: fullName,
        providerId: providerId,
        role: role,
        token: token,
        provider: providerStr ? JSON.parse(providerStr) : null
      };
      setUser(restoredUser);
    }

    setLoading(false); // Done checking localStorage
  }, []);

  const login = (data) => {
    const userToSet = {
      name: data.fullName,
      providerId: data.id,
      role: data.role,
      token: data.token,
      provider: data.provider || null
    };

    // Store all relevant data
    localStorage.setItem('token', data.token);
    localStorage.setItem('fullName', data.fullName);
    localStorage.setItem('providerId', data.id);
    localStorage.setItem('role', data.role);
    localStorage.setItem('user', JSON.stringify(userToSet));

    // Store provider object if exists
    if (data.provider) {
      localStorage.setItem('provider', JSON.stringify(data.provider));
    }

    setUser(userToSet);

    return data.role_id;
  };

  const logout = () => {
    // Clear all stored data
    localStorage.removeItem('token');
    localStorage.removeItem('fullName');
    localStorage.removeItem('providerId');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    localStorage.removeItem('provider');

    setUser(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};