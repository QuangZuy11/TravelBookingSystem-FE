import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check token and other stored data
    const token = localStorage.getItem('token');
    const fullName = localStorage.getItem('fullName');
    const providerId = localStorage.getItem('providerId');
    const role = localStorage.getItem('role');

    // If we have a token and basic user info, restore the user state
    if (token && fullName) {
      const restoredUser = {
        name: fullName,
        providerId: providerId,
        role: role,
        token: token
      };
      setUser(restoredUser);
    }
  }, []);

  const login = (data) => {
    const userToSet = {
      name: data.fullName,
      providerId: data.id,
      role: data.role,
      token: data.token
    };
    
    // Store all relevant data
    localStorage.setItem('token', data.token);
    localStorage.setItem('fullName', data.fullName);
    localStorage.setItem('providerId', data.id);
    localStorage.setItem('role', data.role);
    localStorage.setItem('user', JSON.stringify(userToSet));
    
    setUser(userToSet);
  };

  const logout = () => {
    // Clear all stored data
    localStorage.removeItem('token');
    localStorage.removeItem('fullName');
    localStorage.removeItem('providerId');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    
    setUser(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};