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
    const email = localStorage.getItem('email');
    const phone = localStorage.getItem('phone');
    let providerId = localStorage.getItem('providerId');
    let userId = localStorage.getItem('userId');
    const role = localStorage.getItem('role');
    const providerStr = localStorage.getItem('provider');

    // Debug localStorage
    console.log('🔍 AuthContext Debug - localStorage data:', {
      token: !!token,
      fullName,
      email,
      phone,
      providerId,
      role
    });

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
        fullName: fullName,
        email: email,
        phone: phone,
        providerId: providerId,
        userId: userId,
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
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      providerId: data.provider?._id,
      userId: data.provider?.user_id || data.id, // Use user_id from provider or id from user
      role: data.role,
      token: data.token,
      provider: data.provider || null
    };

    // Store all relevant data
    localStorage.setItem('token', data.token);
    localStorage.setItem('fullName', data.fullName);
    localStorage.setItem('email', data.email || '');
    localStorage.setItem('phone', data.phone || '');
    localStorage.setItem('providerId', data.provider?._id || '');
    localStorage.setItem('userId', data.provider?.user_id || data.id || '');
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

  // Function để update user info (email, phone từ profile)
  const updateUserInfo = (updatedInfo) => {
    if (user) {
      const updatedUser = {
        ...user,
        ...updatedInfo
      };

      // Update localStorage
      if (updatedInfo.email) localStorage.setItem('email', updatedInfo.email);
      if (updatedInfo.phone) localStorage.setItem('phone', updatedInfo.phone);
      if (updatedInfo.fullName) localStorage.setItem('fullName', updatedInfo.fullName);

      setUser(updatedUser);
      console.log('✅ Updated user info:', updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUserInfo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export { AuthContext };