import React, { createContext, useState, useContext, useEffect } from 'react';


const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (data) => {
    const userToSet = {
      name: data.fullName
    };
    localStorage.setItem('token', data.token);
    localStorage.setItem('fullName', userToSet.name);
        setUser(userToSet);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('fullName');
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