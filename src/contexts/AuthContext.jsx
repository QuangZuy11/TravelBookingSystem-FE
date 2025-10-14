import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAuthData } from '../utils/authHelpers';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const navigate = useNavigate();

  useEffect(() => {
    // Check token and other stored data
    const token = localStorage.getItem('token');
    const fullName = localStorage.getItem('fullName');
    let providerId = localStorage.getItem('providerId');
    const role = localStorage.getItem('role');
    const providerStr = localStorage.getItem('provider');

    // Parse provider object
    let provider = null;
    try {
      provider = providerStr ? JSON.parse(providerStr) : null;
    } catch (error) {
      console.error('Error parsing provider:', error);
    }

    // If providerId is missing but provider exists, sync it from provider._id
    if (!providerId && provider && provider._id) {
      providerId = provider._id;
      localStorage.setItem('providerId', providerId);
      console.log('✅ Synced providerId from provider object:', providerId);
    }

    // If we have a token and basic user info, restore the user state
    if (token && fullName) {
      const restoredUser = {
        name: fullName,
        providerId: providerId,
        role: role,
        token: token,
        provider: provider
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
    // Clear all stored data using centralized helper
    clearAuthData();
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